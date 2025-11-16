import { NextResponse } from 'next/server'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

async function generateAnnotatedPDF(
  submissionText: string,
  studentName: string,
  studentId: string,
  feedback: string,
  score: number,
  errors: string[],
  originalPdfBuffer?: Buffer
): Promise<Buffer> {
  // Create a new PDF document
  const pdfDoc = await PDFDocument.create()
  
  // If we have the original PDF, try to load it and add annotations
  let pages: any[] = []
  if (originalPdfBuffer) {
    try {
      const originalPdf = await PDFDocument.load(originalPdfBuffer)
      const pageIndices = originalPdf.getPageIndices()
      for (const pageIndex of pageIndices) {
        const [copiedPage] = await pdfDoc.copyPages(originalPdf, [pageIndex])
        pages.push(copiedPage)
        
        // Add error annotations/highlights to the page
        // Since we can't easily extract exact text positions, we'll add annotation markers
        if (errors && errors.length > 0 && pageIndex === 0) {
          // Add a red border/annotation box at the top of first page to indicate errors
          copiedPage.drawRectangle({
            x: 50,
            y: 750,
            width: 512,
            height: 30,
            borderColor: rgb(1, 0, 0),
            borderWidth: 2,
            color: rgb(1, 0.9, 0.9),
            opacity: 0.3,
          })
        }
      }
    } catch (error) {
      console.error('Failed to load original PDF, creating new one:', error)
    }
  }

  // If no pages from original PDF, create a new page
  if (pages.length === 0) {
    pages.push(pdfDoc.addPage([612, 792])) // US Letter size
  }

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  
  // Add annotation page with feedback
  let annotationPage = pdfDoc.addPage([612, 792])
  let yPosition = 750

  // Title
  annotationPage.drawText('ANNOTATED FEEDBACK REPORT', {
    x: 50,
    y: yPosition,
    size: 18,
    font: boldFont,
    color: rgb(0, 0, 0.8),
  })
  yPosition -= 30

  // Student Info
  annotationPage.drawText(`Student: ${studentName} (${studentId})`, {
    x: 50,
    y: yPosition,
    size: 12,
    font: boldFont,
  })
  yPosition -= 20

  annotationPage.drawText(`Score: ${score}/100`, {
    x: 50,
    y: yPosition,
    size: 12,
    font: boldFont,
    color: score >= 80 ? rgb(0, 0.6, 0) : score >= 60 ? rgb(0.8, 0.6, 0) : rgb(0.8, 0, 0),
  })
  yPosition -= 40

  // Errors Section
  if (errors && errors.length > 0) {
    annotationPage.drawText('Errors Marked:', {
      x: 50,
      y: yPosition,
      size: 14,
      font: boldFont,
      color: rgb(0.8, 0, 0),
    })
    yPosition -= 20

    for (const error of errors.slice(0, 10)) {
      if (yPosition < 50) {
        annotationPage = pdfDoc.addPage([612, 792])
        yPosition = 750
      }
      annotationPage.drawText(`• ${error}`, {
        x: 60,
        y: yPosition,
        size: 10,
        font: font,
        color: rgb(0.6, 0, 0),
      })
      yPosition -= 15
    }
    yPosition -= 20
  }

  // Feedback Section
  annotationPage.drawText('Detailed Feedback:', {
    x: 50,
    y: yPosition,
    size: 14,
    font: boldFont,
  })
  yPosition -= 20

  // Split feedback into lines that fit the page
  const feedbackLines = feedback.split('\n')
  for (const line of feedbackLines) {
    if (yPosition < 50) {
      annotationPage = pdfDoc.addPage([612, 792])
      yPosition = 750
    }
    
    // Wrap long lines
    const words = line.split(' ')
    let currentLine = ''
    for (const word of words) {
      const testLine = currentLine + (currentLine ? ' ' : '') + word
      if (testLine.length > 80) {
        if (currentLine) {
          annotationPage.drawText(currentLine, {
            x: 50,
            y: yPosition,
            size: 10,
            font: font,
          })
          yPosition -= 12
          if (yPosition < 50) {
            annotationPage = pdfDoc.addPage([612, 792])
            yPosition = 750
          }
          currentLine = word
        }
      } else {
        currentLine = testLine
      }
    }
    if (currentLine) {
      annotationPage.drawText(currentLine, {
        x: 50,
        y: yPosition,
        size: 10,
        font: font,
      })
      yPosition -= 12
    }
  }

  // Add original submission text with error highlighting if available
  if (submissionText) {
    let submissionPage = pdfDoc.addPage([612, 792])
    let subYPosition = 750

    submissionPage.drawText('ORIGINAL SUBMISSION WITH ERROR MARKINGS', {
      x: 50,
      y: subYPosition,
      size: 16,
      font: boldFont,
      color: rgb(0, 0, 0.8),
    })
    subYPosition -= 30

    // Add error legend
    if (errors && errors.length > 0) {
      submissionPage.drawRectangle({
        x: 50,
        y: subYPosition - 5,
        width: 512,
        height: 25,
        borderColor: rgb(1, 0, 0),
        borderWidth: 1,
        color: rgb(1, 0.95, 0.95),
        opacity: 0.5,
      })
      submissionPage.drawText('⚠️ Errors are highlighted in red boxes below', {
        x: 60,
        y: subYPosition,
        size: 10,
        font: boldFont,
        color: rgb(0.8, 0, 0),
      })
      subYPosition -= 35
    }

    const submissionLines = submissionText.split('\n')
    let errorIndex = 0
    for (const line of submissionLines) {
      if (subYPosition < 50) {
        submissionPage = pdfDoc.addPage([612, 792])
        subYPosition = 750
      }
      
      // Check if this line might contain an error (simple heuristic)
      const hasError = errors && errors.some(err => 
        line.toLowerCase().includes(err.toLowerCase().substring(0, 20)) ||
        err.toLowerCase().includes(line.toLowerCase().substring(0, 20))
      )
      
      // Highlight error lines with a red background
      if (hasError && errorIndex < errors.length) {
        submissionPage.drawRectangle({
          x: 45,
          y: subYPosition - 2,
          width: 522,
          height: 14,
          color: rgb(1, 0.9, 0.9),
          opacity: 0.4,
        })
        errorIndex++
      }
      
      const words = line.split(' ')
      let currentLine = ''
      for (const word of words) {
        const testLine = currentLine + (currentLine ? ' ' : '') + word
        if (testLine.length > 80) {
          if (currentLine) {
            submissionPage.drawText(currentLine, {
              x: 50,
              y: subYPosition,
              size: 10,
              font: font,
              color: hasError ? rgb(0.8, 0, 0) : rgb(0, 0, 0),
            })
            subYPosition -= 12
            if (subYPosition < 50) {
              submissionPage = pdfDoc.addPage([612, 792])
              subYPosition = 750
            }
            currentLine = word
          }
        } else {
          currentLine = testLine
        }
      }
      if (currentLine) {
        submissionPage.drawText(currentLine, {
          x: 50,
          y: subYPosition,
          size: 10,
          font: font,
          color: hasError ? rgb(0.8, 0, 0) : rgb(0, 0, 0),
        })
        subYPosition -= 12
      }
    }
  }

  const pdfBytes = await pdfDoc.save()
  return Buffer.from(pdfBytes)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      courseId,
      assignmentId,
      studentId,
      studentName,
      submissionText,
      feedback,
      score,
      errors,
      originalPdfPath
    } = body

    if (!feedback) {
      return NextResponse.json({ error: 'Feedback is required' }, { status: 400 })
    }

    // Try to read original PDF if path is provided
    let originalPdfBuffer: Buffer | undefined = undefined
    if (originalPdfPath) {
      try {
        // If it's a URL path, try to construct the file system path
        let filePath = originalPdfPath
        if (originalPdfPath.includes('/api/submissions/pdf')) {
          // Extract filename from URL
          const url = new URL(originalPdfPath, 'http://localhost')
          const filename = url.searchParams.get('filename')
          if (filename && courseId && assignmentId) {
            filePath = join(process.cwd(), 'dataset', 'submissions', courseId, assignmentId, filename)
          }
        } else if (!originalPdfPath.startsWith('/') && !existsSync(originalPdfPath)) {
          // Try relative path from submissions directory
          if (courseId && assignmentId) {
            filePath = join(process.cwd(), 'dataset', 'submissions', courseId, assignmentId, originalPdfPath)
          }
        }
        
        if (existsSync(filePath)) {
          originalPdfBuffer = readFileSync(filePath)
        }
      } catch (error) {
        console.error('Failed to read original PDF:', error)
      }
    }

    // Generate annotated PDF
    try {
      const annotatedPdf = await generateAnnotatedPDF(
        submissionText || 'No submission text available',
        studentName || 'Student',
        studentId || 'Unknown',
        feedback || 'No feedback available',
        typeof score === 'number' ? score : 0,
        Array.isArray(errors) ? errors : [],
        originalPdfBuffer
      )

      // Return the PDF as a response for download
      const safeFileName = `${studentName || 'Student'}_${studentId || 'Unknown'}_annotated`.replace(/[^a-zA-Z0-9_-]/g, '_')
      
      return new NextResponse(new Uint8Array(annotatedPdf), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${safeFileName}.pdf"`,
        },
      })
    } catch (pdfError: any) {
      console.error('Error in generateAnnotatedPDF:', pdfError);
      return NextResponse.json({ 
        error: `Failed to generate PDF: ${pdfError.message || 'Unknown error'}` 
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Error generating annotated PDF:', error)
    return NextResponse.json({ 
      error: `Failed to generate annotated PDF: ${error.message || 'Unknown error'}` 
    }, { status: 500 })
  }
}

