import { NextResponse } from 'next/server'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'

interface Course {
  course_id: string
  faculty_id: string
  name: string
  description: string
  strength: number
  syllabus_file: string
  timeline_file: string
}

function loadCoursesData(): Course[] {
  try {
    const filePath = join(process.cwd(), 'dataset', 'courses', 'courses.json')
    if (!existsSync(filePath)) {
      return []
    }
    const fileContent = readFileSync(filePath, 'utf-8')
    return JSON.parse(fileContent)
  } catch (error) {
    console.error('Error loading courses data:', error)
    return []
  }
}

function loadSyllabusContent(courseId: string): string {
  try {
    const txtPath = join(process.cwd(), 'dataset', 'syllabus', courseId, 'syllabus.txt')
    if (existsSync(txtPath)) {
      return readFileSync(txtPath, 'utf-8')
    }
    return ''
  } catch (error) {
    console.error(`Error loading syllabus for ${courseId}:`, error)
    return ''
  }
}

// In-memory course storage (also persisted to JSON file)
let coursesDB: any[] = []

/**
 * Extract text content from a PDF file using pdf-parse library
 * @param file - The PDF file to extract text from
 * @returns Extracted text content as a string
 */
async function extractTextFromPDF(file: File): Promise<string> {
  try {
    // Convert File to Buffer for pdf-parse
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    // Dynamically import pdf-parse to avoid webpack bundling issues in Next.js
    const pdfParseModule = await import('pdf-parse')
    const pdf = pdfParseModule.default || pdfParseModule
    
    // Use pdf-parse to extract text from PDF
    const data = await pdf(buffer)
    
    // Return extracted text content
    return data.text
  } catch (error) {
    console.error('PDF extraction error:', error)
    throw new Error('Failed to extract text from PDF. Please ensure the file is a valid PDF.')
  }
}

// GET all courses (optionally filtered by faculty_id)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const facultyId = searchParams.get('faculty_id')
    
    // Load courses from JSON file
    const coursesData = loadCoursesData()
    
    if (coursesData.length === 0) {
      console.error('No courses found in JSON file')
      return NextResponse.json({ courses: [] })
    }
    
    // Combine file data with in-memory array (avoid duplicates)
    const allCourses = [...coursesData]
    coursesDB.forEach(course => {
      const exists = coursesData.some(c => (c.course_id || c.id) === (course.course_id || course.id))
      if (!exists) {
        allCourses.push(course)
      }
    })
    
    // Filter by faculty_id if provided
    let filteredCourses = allCourses
    if (facultyId) {
      filteredCourses = allCourses.filter(c => {
        const courseFacultyId = c.faculty_id || ''
        return courseFacultyId === facultyId
      })
    }
    
    // Transform to match expected format and load syllabus content
    const courses = filteredCourses.map(course => {
      try {
        const courseId = course.course_id || course.id || course.code
        let syllabusContent = course.syllabusContent || ''
        if (!syllabusContent && courseId) {
          try {
            syllabusContent = loadSyllabusContent(courseId)
          } catch (err) {
            syllabusContent = ''
          }
        }
        return {
          id: courseId,
          code: course.code || courseId,
          name: course.name,
          description: course.description || '',
          duration: course.duration || '12 weeks',
          students: course.students || course.strength || 0,
          syllabusContent: syllabusContent,
          syllabusUrl: course.syllabus_file || course.syllabusUrl,
          timetableUrl: course.timeline_file || course.timetableUrl,
          faculty_id: course.faculty_id || facultyId || '',
          createdAt: course.createdAt || new Date().toISOString()
        }
      } catch (error) {
        console.error('Error transforming course:', error)
        return null
      }
    }).filter(c => c !== null)
    
    return NextResponse.json({ courses })
  } catch (error) {
    console.error('Error fetching courses:', error)
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 })
  }
}

/**
 * POST endpoint to add a new course
 * Extracts text from uploaded PDF syllabus and saves it as syllabusContent
 */
export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    
    // Extract form fields
    const name = formData.get('name') as string
    const code = formData.get('code') as string
    const duration = formData.get('duration') as string
    const students = Number.parseInt(formData.get('students') as string)
    const syllabusFile = formData.get('syllabus') as File | null
    const facultyId = formData.get('faculty_id') as string || 'F101' // Default faculty ID
    
    // Initialize syllabusContent - will store extracted text from PDF
    let syllabusContent = ''
    
    // Process syllabus file if uploaded
    if (syllabusFile) {
      if (syllabusFile.type === 'application/pdf') {
        // Extract text from PDF using pdf-parse library
        try {
          syllabusContent = await extractTextFromPDF(syllabusFile)
        } catch (error) {
          return NextResponse.json({ 
            error: 'Failed to extract text from PDF. Please ensure the file is a valid PDF.' 
          }, { status: 400 })
        }
      } else if (syllabusFile.type === 'text/plain') {
        // Plain text file - read directly
        syllabusContent = await syllabusFile.text()
      } else {
        // For .doc/.docx, try reading as text (limited support)
        syllabusContent = await syllabusFile.text()
      }
      
      // Save syllabus content to file system for backup
      if (syllabusContent) {
        const syllabusDir = join(process.cwd(), 'dataset', 'syllabus', code)
        if (!existsSync(syllabusDir)) {
          mkdirSync(syllabusDir, { recursive: true })
        }
        const syllabusTxtPath = join(syllabusDir, 'syllabus.txt')
        writeFileSync(syllabusTxtPath, syllabusContent, 'utf-8')
      }
    }
    
    // Create course record with extracted syllabusContent
    const courseId = code || `C${Date.now()}`
    const newCourse = {
      course_id: courseId,
      faculty_id: facultyId,
      name,
      code,
      description: `${name} - ${code}`,
      duration,
      strength: students,
      syllabusContent: syllabusContent, // Store extracted text, not the PDF file
      syllabus_file: syllabusFile ? `syllabus/${code}/syllabus.txt` : '',
      timeline_file: '',
      createdAt: new Date().toISOString()
    }
    
    // Add to in-memory array for immediate access
    coursesDB.push(newCourse)
    
    // Persist to JSON file for permanent storage
    try {
      const coursesData = loadCoursesData()
      const updatedCourses = [...coursesData, newCourse]
      const coursesFilePath = join(process.cwd(), 'dataset', 'courses', 'courses.json')
      writeFileSync(coursesFilePath, JSON.stringify(updatedCourses, null, 2), 'utf-8')
    } catch (error) {
      console.error('Failed to save to JSON file:', error)
    }
    
    return NextResponse.json({ success: true, course: newCourse })
  } catch (error) {
    console.error('Course creation error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to create course' 
    }, { status: 500 })
  }
}

/**
 * DELETE endpoint to remove a course
 * Removes course from both in-memory array and JSON file
 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 })
    }
    
    // Remove from in-memory array (check both id and course_id fields)
    coursesDB = coursesDB.filter(c => c.id !== id && c.course_id !== id)
    
    // Remove from JSON file
    try {
      const coursesData = loadCoursesData()
      const filteredCourses = coursesData.filter(c => c.course_id !== id && c.id !== id)
      const coursesFilePath = join(process.cwd(), 'dataset', 'courses', 'courses.json')
      writeFileSync(coursesFilePath, JSON.stringify(filteredCourses, null, 2), 'utf-8')
    } catch (error) {
      console.error('Failed to remove from JSON file:', error)
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete course error:', error)
    return NextResponse.json({ error: 'Failed to delete course' }, { status: 500 })
  }
}
