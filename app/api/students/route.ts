import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'

interface Student {
  student_id: string
  name: string
  email: string
  password_hash: string
  enrolled_courses: string[]
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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('student_id')
    
    const studentsData = loadStudentsData()
    
    if (studentId) {
      // Return specific student
      const student = studentsData.find(s => s.student_id === studentId)
      if (!student) {
        return NextResponse.json({ error: 'Student not found' }, { status: 404 })
      }
      return NextResponse.json({ student })
    }
    
    // Return all students
    return NextResponse.json({ students: studentsData })
  } catch (error) {
    console.error('Error fetching students:', error)
    return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 })
  }
}





