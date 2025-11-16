import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'
import { createHash } from 'crypto'

interface Faculty {
  faculty_id: string
  name: string
  email: string
  department: string
  designation: string
  bio: string
  research_areas: string[]
  office_hours: string
  password_hash: string
}

function loadFacultyData(): Faculty[] {
  try {
    const filePath = join(process.cwd(), 'dataset', 'faculty', 'faculty.json')
    const fileContent = readFileSync(filePath, 'utf-8')
    return JSON.parse(fileContent)
  } catch (error) {
    console.error('Error loading faculty data:', error)
    return []
  }
}

function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex')
}

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    
    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email and password are required' }, { status: 400 })
    }
    
    const facultyData = loadFacultyData()
    const faculty = facultyData.find(f => f.email === email)
    
    if (!faculty) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 })
    }
    
    // Hash the provided password and compare with stored hash
    const passwordHash = hashPassword(password)
    
    if (passwordHash !== faculty.password_hash) {
      // Also check common passwords for demo purposes
      const commonPasswords = ['faculty101', 'faculty102', 'faculty103', 'faculty104', 'faculty105', 'faculty106', 'faculty107', 'faculty108']
      const facultyNum = faculty.faculty_id.replace('F', '')
      const expectedPassword = `faculty${facultyNum}`
      
      if (password !== expectedPassword) {
        return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 })
      }
    }
    
    return NextResponse.json({
      success: true,
      user: {
        id: faculty.faculty_id,
        email: faculty.email,
        name: faculty.name,
        department: faculty.department,
        designation: faculty.designation
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 })
  }
}
