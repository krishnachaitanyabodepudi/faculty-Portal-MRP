import { NextResponse } from 'next/server'
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs'
import { join } from 'path'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    
    const courseId = formData.get('course_id') as string
    const assignmentId = formData.get('assignment_id') as string
    const studentId = formData.get('student_id') as string
    const studentName = formData.get('student_name') as string
    const file = formData.get('file') as File | null
    
    if (!courseId || !assignmentId || !studentId || !studentName || !file) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Create submission directory if it doesn't exist
    const submissionsDir = join(process.cwd(), 'dataset', 'submissions', courseId, assignmentId)
    if (!existsSync(submissionsDir)) {
      mkdirSync(submissionsDir, { recursive: true })
    }

    // Generate unique filename based on student ID and timestamp
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop() || 'txt'
    const filename = `${studentId}_${timestamp}.${fileExtension}`
    const filePath = join(submissionsDir, filename)

    // Save file
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    writeFileSync(filePath, buffer)

    // Also save as .txt if it's a PDF (for text extraction later)
    if (fileExtension === 'pdf') {
      // For now, just save the PDF. Text extraction can be done when needed
      const txtFilename = `${studentId}_${timestamp}.txt`
      const txtPath = join(submissionsDir, txtFilename)
      // We'll extract text when viewing, for now just create a placeholder
      writeFileSync(txtPath, `Submission by ${studentName} (${studentId})\n\n[PDF content will be extracted when viewing]`)
    }

    // Save submission metadata
    const metadataFile = join(submissionsDir, 'submissions_metadata.json')
    let metadata: any[] = []
    
    if (existsSync(metadataFile)) {
      try {
        const existingData = readFileSync(metadataFile, 'utf-8')
        metadata = JSON.parse(existingData)
      } catch (e) {
        metadata = []
      }
    }

    const submissionMetadata = {
      filename,
      student_id: studentId,
      student_name: studentName,
      submitted_at: new Date().toISOString(),
      course_id: courseId,
      assignment_id: assignmentId
    }

    metadata.push(submissionMetadata)
    writeFileSync(metadataFile, JSON.stringify(metadata, null, 2), 'utf-8')

    return NextResponse.json({ 
      success: true, 
      message: 'Submission uploaded successfully',
      submission: submissionMetadata
    })
  } catch (error) {
    console.error('Error uploading submission:', error)
    return NextResponse.json({ error: 'Failed to upload submission' }, { status: 500 })
  }
}






