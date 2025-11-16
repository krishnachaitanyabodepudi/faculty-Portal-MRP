import { NextResponse } from 'next/server'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('course_id')
    const assignmentId = searchParams.get('assignment_id')
    const filename = searchParams.get('filename')
    
    if (!courseId || !assignmentId || !filename) {
      return NextResponse.json({ error: 'course_id, assignment_id, and filename are required' }, { status: 400 })
    }
    
    const submissionsDir = join(process.cwd(), 'dataset', 'submissions', courseId, assignmentId)
    const pdfPath = join(submissionsDir, filename)
    
    if (!existsSync(pdfPath)) {
      // Try to find PDF version if filename is .txt
      if (filename.endsWith('.txt')) {
        const pdfFilename = filename.replace('.txt', '.pdf')
        const pdfPathAlt = join(submissionsDir, pdfFilename)
        if (existsSync(pdfPathAlt)) {
          const pdfBuffer = readFileSync(pdfPathAlt)
          return new Response(pdfBuffer, {
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': `inline; filename="${pdfFilename}"`,
            },
          })
        }
      }
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }
    
    // Determine content type based on file extension
    let contentType = 'application/pdf'
    if (filename.endsWith('.txt')) {
      contentType = 'text/plain'
    } else if (filename.endsWith('.doc') || filename.endsWith('.docx')) {
      contentType = 'application/msword'
    }
    
    const fileBuffer = readFileSync(pdfPath)
    
    return new Response(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Error serving file:', error)
    return NextResponse.json({ error: 'Failed to serve file' }, { status: 500 })
  }
}


