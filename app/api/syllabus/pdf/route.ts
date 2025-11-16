import { NextResponse } from 'next/server'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('course_id')
    
    if (!courseId) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 })
    }
    
    const pdfPath = join(process.cwd(), 'dataset', 'syllabus', courseId, 'syllabus.pdf')
    
    if (!existsSync(pdfPath)) {
      return NextResponse.json({ error: 'Syllabus PDF not found' }, { status: 404 })
    }
    
    const pdfBuffer = readFileSync(pdfPath)
    
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="syllabus-${courseId}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Error serving syllabus PDF:', error)
    return NextResponse.json({ error: 'Failed to serve syllabus PDF' }, { status: 500 })
  }
}






