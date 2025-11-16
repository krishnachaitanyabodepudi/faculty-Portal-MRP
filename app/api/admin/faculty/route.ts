import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'

interface Faculty {
  faculty_id: string
  name: string
  email: string
  department: string
  designation: string
  bio: string
  research_areas: string[]
  office_hours: string
}

interface Course {
  course_id: string
  faculty_id: string
  name: string
  code: string
  description: string
  duration: string
  strength: number
  syllabusContent?: string
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
    const syllabusPath = join(process.cwd(), 'dataset', 'syllabus', courseId, 'syllabus.txt')
    return readFileSync(syllabusPath, 'utf-8')
  } catch (error) {
    return ''
  }
}

export async function GET() {
  try {
    const facultyData = loadFacultyData()
    const coursesData = loadCoursesData()

    const facultyWithCourses = facultyData.map(faculty => {
      const facultyCourses = coursesData
        .filter(course => course.faculty_id === faculty.faculty_id)
        .map(course => {
          const syllabusContent = loadSyllabusContent(course.course_id)
          return {
            ...course,
            syllabusContent: syllabusContent || course.syllabusContent || ''
          }
        })

      return {
        ...faculty,
        courses: facultyCourses,
        courseCount: facultyCourses.length
      }
    })

    return NextResponse.json({ faculty: facultyWithCourses })
  } catch (error) {
    console.error('Error fetching faculty data:', error)
    return NextResponse.json({ error: 'Failed to fetch faculty data' }, { status: 500 })
  }
}
