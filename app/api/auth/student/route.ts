import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'
import { createHash } from 'crypto'

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

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email and password are required' }, { status: 400 })
    }

    const trimmedEmail = email.trim().toLowerCase()
    const trimmedPassword = password.trim()

    const students = loadStudentsData()
    const hashedPassword = createHash('sha256').update(trimmedPassword).digest('hex')

    const student = students.find(s => {
      const studentEmail = s.email.toLowerCase()
      const emailMatch = studentEmail === trimmedEmail
      const passwordMatch = s.password_hash === hashedPassword
      return emailMatch && passwordMatch
    })

    if (student) {
      return NextResponse.json({
        success: true,
        user: {
          id: student.student_id,
          email: student.email,
          name: student.name,
          enrolled_courses: student.enrolled_courses,
          role: 'student'
        }
      })
    } else {
      const emailExists = students.some(s => s.email.toLowerCase() === trimmedEmail)
      if (emailExists) {
        return NextResponse.json({ success: false, error: 'Invalid password' }, { status: 401 })
      } else {
        return NextResponse.json({ success: false, error: 'Invalid email or password' }, { status: 401 })
      }
    }
  } catch (error) {
    console.error('Student login error:', error)
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 })
  }
}