import { NextResponse } from 'next/server'
import { readFileSync, writeFileSync, existsSync, rmSync } from 'fs'
import { join } from 'path'

interface Assignment {
  assignment_id: string
  course_id: string
  title: string
  description: string
  deliverables: string[]
  submission_instructions: string
  formatting_requirements: string
  due_date: string
  max_score: number
  weight: number
}

function loadAssignmentsData(): Assignment[] {
  try {
    const filePath = join(process.cwd(), 'dataset', 'assignments', 'assignments.json')
    const fileContent = readFileSync(filePath, 'utf-8')
    return JSON.parse(fileContent)
  } catch (error) {
    console.error('Error loading assignments data:', error)
    return []
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('course_id')
    
    const assignmentsData = loadAssignmentsData()
    let filteredAssignments = assignmentsData
    
    if (courseId) {
      filteredAssignments = assignmentsData.filter(a => a.course_id === courseId)
    }
    
    return NextResponse.json({ assignments: filteredAssignments })
  } catch (error) {
    console.error('Error fetching assignments:', error)
    return NextResponse.json({ error: 'Failed to fetch assignments' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { courseId, questions, title, description, dueDate, maxScore } = body
    
    // Support both old format (questions array) and new format (single assignment)
    if (!courseId) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 })
    }

    const assignmentsData = loadAssignmentsData()
    const newAssignments = []

    if (questions && Array.isArray(questions)) {
      // Old format: multiple questions
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i].trim()
        if (!question) continue

        const assignmentId = `${courseId}_A${String(i + 1).padStart(2, '0')}`
        const assignment = {
          assignment_id: assignmentId,
          course_id: courseId,
          title: `Assignment ${i + 1}`,
          description: question,
          deliverables: ['Written submission', 'Code files (if applicable)'],
          submission_instructions: 'Submit via the course portal before the deadline.',
          formatting_requirements: 'APA format, 12pt font, double-spaced',
          due_date: new Date(Date.now() + (i + 1) * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          max_score: 100,
          weight: 25
        }

        newAssignments.push(assignment)
        assignmentsData.push(assignment)
      }
    } else {
      // New format: single assignment with full details
      if (!title || !description || !dueDate) {
        return NextResponse.json({ error: 'Title, description, and due date are required' }, { status: 400 })
      }

      // Find next assignment number for this course
      const existingAssignments = assignmentsData.filter(a => a.course_id === courseId)
      const nextNum = existingAssignments.length + 1
      const assignmentId = `${courseId}_A${String(nextNum).padStart(2, '0')}`

      const assignment = {
        assignment_id: assignmentId,
        course_id: courseId,
        title: title,
        description: description,
        deliverables: ['Written submission', 'Code files (if applicable)'],
        submission_instructions: 'Submit via the course portal before the deadline.',
        formatting_requirements: 'APA format, 12pt font, double-spaced',
        due_date: dueDate,
        max_score: maxScore ? parseInt(maxScore) : 100,
        weight: 25
      }

      newAssignments.push(assignment)
      assignmentsData.push(assignment)
    }

    // Save to file
    const assignmentsFilePath = join(process.cwd(), 'dataset', 'assignments', 'assignments.json')
    writeFileSync(assignmentsFilePath, JSON.stringify(assignmentsData, null, 2), 'utf-8')

    return NextResponse.json({ success: true, assignments: newAssignments })
  } catch (error) {
    console.error('Error creating assignments:', error)
    return NextResponse.json({ error: 'Failed to create assignments' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const assignmentId = searchParams.get('assignment_id')
    
    if (!assignmentId) {
      return NextResponse.json({ error: 'assignment_id is required' }, { status: 400 })
    }

    const assignmentsData = loadAssignmentsData()
    const assignmentIndex = assignmentsData.findIndex(a => a.assignment_id === assignmentId)
    
    if (assignmentIndex === -1) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
    }

    // Remove the assignment
    const deletedAssignment = assignmentsData.splice(assignmentIndex, 1)[0]
    
    // Save updated assignments to file
    const assignmentsFilePath = join(process.cwd(), 'dataset', 'assignments', 'assignments.json')
    writeFileSync(assignmentsFilePath, JSON.stringify(assignmentsData, null, 2), 'utf-8')

    // Also delete related rubrics if they exist
    try {
      const rubricsFilePath = join(process.cwd(), 'dataset', 'rubrics', 'rubrics.json')
      if (existsSync(rubricsFilePath)) {
        const rubricsData = JSON.parse(readFileSync(rubricsFilePath, 'utf-8'))
        const filteredRubrics = rubricsData.filter((r: any) => r.assignment_id !== assignmentId)
        writeFileSync(rubricsFilePath, JSON.stringify(filteredRubrics, null, 2), 'utf-8')
      }
    } catch (error) {
      console.error('Error deleting related rubrics:', error)
      // Continue even if rubric deletion fails
    }

    // Delete any submissions for this assignment from dataset/submissions/<courseId>/<assignmentId>
    try {
      const submissionsDir = join(
        process.cwd(),
        'dataset',
        'submissions',
        deletedAssignment.course_id,
        assignmentId
      )
      if (existsSync(submissionsDir)) {
        rmSync(submissionsDir, { recursive: true, force: true })
      }
    } catch (error) {
      console.error('Error deleting assignment submissions directory:', error)
      // This should not block the main delete operation
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Assignment deleted successfully',
      deletedAssignment 
    })
  } catch (error) {
    console.error('Error deleting assignment:', error)
    return NextResponse.json({ error: 'Failed to delete assignment' }, { status: 500 })
  }
}


