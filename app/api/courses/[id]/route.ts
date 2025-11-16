import { NextResponse } from 'next/server'
import { readFileSync, existsSync } from 'fs'
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

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const coursesData = loadCoursesData()
    const courseData = coursesData.find(c => c.course_id === params.id)
    
    if (!courseData) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }
    
    const syllabusContent = loadSyllabusContent(courseData.course_id)
    
    const course = {
      id: courseData.course_id,
      code: courseData.course_id,
      name: courseData.name,
      description: courseData.description,
      duration: '12 weeks',
      students: courseData.strength,
      syllabusContent: syllabusContent,
      syllabusUrl: courseData.syllabus_file,
      timetableUrl: courseData.timeline_file,
      faculty_id: courseData.faculty_id,
      createdAt: new Date().toISOString()
    }
    
    return NextResponse.json({ course })
  } catch (error) {
    console.error('Error fetching course:', error)
    return NextResponse.json({ error: 'Failed to fetch course' }, { status: 500 })
  }
}
