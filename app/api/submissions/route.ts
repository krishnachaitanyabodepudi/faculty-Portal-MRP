import { NextResponse } from 'next/server'
import { readFileSync, readdirSync, existsSync } from 'fs'
import { join } from 'path'

interface Student {
  student_id: string
  name: string
  email: string
}

function loadStudentsData(): Student[] {
  try {
    const filePath = join(process.cwd(), 'dataset', 'students', 'students.json')
    const fileContent = readFileSync(filePath, 'utf-8')
    return JSON.parse(fileContent)
  } catch (error) {
    console.error('Error loading students data:', error)
    return []
  }
}

function getStudentName(studentId: string): string {
  const students = loadStudentsData()
  const student = students.find(s => s.student_id === studentId)
  return student?.name || `Student ${studentId.replace('S', '')}`
}

interface SubmissionFile {
  filename: string
  content: string
  path: string
  student_id?: string
  student_name?: string
  submitted_at?: string
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('course_id')
    const assignmentId = searchParams.get('assignment_id')
    
    if (!courseId || !assignmentId) {
      return NextResponse.json({ error: 'course_id and assignment_id are required' }, { status: 400 })
    }
    
    const submissionsDir = join(process.cwd(), 'dataset', 'submissions', courseId, assignmentId)
    
    if (!existsSync(submissionsDir)) {
      return NextResponse.json({ submissions: [] })
    }
    
    // Check for metadata file first (new submissions from students)
    const metadataFile = join(submissionsDir, 'submissions_metadata.json')
    let submissions: SubmissionFile[] = []
    
    if (existsSync(metadataFile)) {
      try {
        const metadataContent = readFileSync(metadataFile, 'utf-8')
        const metadata = JSON.parse(metadataContent)
        
        for (const meta of metadata) {
          const filePath = join(submissionsDir, meta.filename)
          if (existsSync(filePath)) {
            try {
              // Try to read as text, if it's PDF we'll handle it separately
              let content = ''
              if (meta.filename.endsWith('.txt')) {
                content = readFileSync(filePath, 'utf-8')
              } else if (meta.filename.endsWith('.pdf')) {
                // For PDF, try to find corresponding .txt file or use placeholder
                const txtPath = filePath.replace('.pdf', '.txt')
                if (existsSync(txtPath)) {
                  content = readFileSync(txtPath, 'utf-8')
                } else {
                  content = `[PDF submission by ${meta.student_name} (${meta.student_id})]`
                }
              } else {
                content = readFileSync(filePath, 'utf-8')
              }
              
              // Use real student name from students dataset if available
              const realStudentName = meta.student_id ? getStudentName(meta.student_id) : meta.student_name
              submissions.push({
                filename: meta.filename,
                content: content,
                path: filePath,
                student_id: meta.student_id,
                student_name: realStudentName,
                submitted_at: meta.submitted_at
              })
            } catch (error) {
              console.error(`Error reading file ${meta.filename}:`, error)
            }
          }
        }
      } catch (error) {
        console.error('Error reading metadata:', error)
      }
    }
    
    // Also include old format submissions (sub01.txt, sub02.txt, etc.) for backward compatibility
    const files = readdirSync(submissionsDir)
    const txtFiles = files.filter(f => f.endsWith('.txt') && f.startsWith('sub') && !f.includes('_'))
    
    for (const file of txtFiles) {
      // Skip if already in submissions from metadata
      if (submissions.find(s => s.filename === file)) continue
      
      const filePath = join(submissionsDir, file)
      try {
        const content = readFileSync(filePath, 'utf-8')
        const submissionNum = file.match(/sub(\d+)/)?.[1] || '0'
        const studentId = `S${submissionNum.padStart(3, '0')}`
        const studentName = getStudentName(studentId)
        submissions.push({
          filename: file,
          content: content,
          path: filePath,
          student_id: studentId,
          student_name: studentName
        })
      } catch (error) {
        console.error(`Error reading file ${file}:`, error)
      }
    }
    
    return NextResponse.json({ submissions })
  } catch (error) {
    console.error('Error fetching submissions:', error)
    return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 })
  }
}


