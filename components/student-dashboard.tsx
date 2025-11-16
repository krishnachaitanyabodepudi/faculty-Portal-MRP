"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, LogOut, FileText, Upload, CheckCircle, Clock } from "lucide-react"
import { StudentAssignmentView } from "./student-assignment-view"

interface Student {
  id: string
  email: string
  name: string
  enrolled_courses: string[]
  role: string
}

interface Course {
  course_id: string
  name: string
  code: string
  description: string
  faculty_id: string
}

interface Assignment {
  assignment_id: string
  course_id: string
  title: string
  description: string
  due_date: string
  max_score: number
  submissionStatus?: 'submitted' | 'not_submitted'
  submittedAt?: string
}

interface StudentDashboardProps {
  student: Student
  onLogout: () => void
}

export function StudentDashboard({ student, onLogout }: StudentDashboardProps) {
  const [courses, setCourses] = useState<Course[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchCourses()
  }, [student])

  useEffect(() => {
    if (selectedCourse) {
      fetchAssignments(selectedCourse.course_id)
    }
  }, [selectedCourse])

  const fetchCourses = async () => {
    try {
      const allCourses = await Promise.all(
        student.enrolled_courses.map(async (courseId) => {
          const response = await fetch(`/api/courses/${courseId}`)
          const data = await response.json()
          if (data.course) {
            // Map API response to match Course interface
            return {
              course_id: data.course.id || courseId,
              name: data.course.name,
              code: data.course.code || courseId,
              description: data.course.description || '',
              faculty_id: data.course.faculty_id || ''
            }
          }
          return null
        })
      )
      // Filter out null/undefined
      const validCourses = allCourses.filter((course): course is Course => course != null)
      setCourses(validCourses)
    } catch (error) {
      console.error('Failed to fetch courses:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAssignments = async (courseId: string) => {
    try {
      const response = await fetch(`/api/assignments?course_id=${courseId}`)
      const data = await response.json()
      if (data.assignments) {
        // Fetch submission status for each assignment
        const assignmentsWithStatus = await Promise.all(
          data.assignments.map(async (assignment: Assignment) => {
            try {
              const submissionsResponse = await fetch(
                `/api/submissions?course_id=${courseId}&assignment_id=${assignment.assignment_id}`
              )
              const submissionsData = await submissionsResponse.json()
              
              // Check if current student has submitted
              const studentSubmission = submissionsData.submissions?.find(
                (sub: any) => sub.student_id === student.id
              )
              
              return {
                ...assignment,
                submissionStatus: studentSubmission ? 'submitted' : 'not_submitted',
                submittedAt: studentSubmission?.submitted_at
              }
            } catch (error) {
              console.error(`Failed to fetch submission status for ${assignment.assignment_id}:`, error)
              return {
                ...assignment,
                submissionStatus: 'not_submitted' as const
              }
            }
          })
        )
        setAssignments(assignmentsWithStatus)
      }
    } catch (error) {
      console.error('Failed to fetch assignments:', error)
    }
  }

  if (selectedAssignment && selectedCourse) {
    return (
      <StudentAssignmentView
        assignment={selectedAssignment}
        course={selectedCourse}
        student={student}
        onBack={() => setSelectedAssignment(null)}
        onLogout={onLogout}
      />
    )
  }

  if (selectedCourse) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <Button variant="ghost" onClick={() => setSelectedCourse(null)} className="mb-4">
                ← Back to Courses
              </Button>
              <h1 className="text-3xl font-black text-gray-900 dark:text-white">
                {selectedCourse.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">{selectedCourse.code}</p>
            </div>
            <Button variant="outline" onClick={onLogout} className="gap-2">
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>

          <div className="grid gap-4">
            {assignments.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-gray-500">No assignments available for this course.</p>
                </CardContent>
              </Card>
            ) : (
              assignments.map((assignment, index) => (
                <Card key={assignment.assignment_id || `assignment-${index}`} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl">{assignment.title}</CardTitle>
                        <CardDescription className="mt-2">
                          Due: {new Date(assignment.due_date).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        {new Date(assignment.due_date) > new Date() ? 'Upcoming' : 'Past Due'}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-2">
                      {assignment.description.substring(0, 150)}...
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                          Max Score: {assignment.max_score}
                        </span>
                        {assignment.submissionStatus === 'submitted' && (
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-green-600 dark:text-green-400 font-medium">
                              Submitted
                              {assignment.submittedAt && (
                                <span className="text-gray-500 ml-1">
                                  ({new Date(assignment.submittedAt).toLocaleDateString()})
                                </span>
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                      <Button
                        onClick={() => setSelectedAssignment(assignment)}
                        className="gap-2"
                        variant={assignment.submissionStatus === 'submitted' ? 'outline' : 'default'}
                      >
                        <FileText className="w-4 h-4" />
                        {assignment.submissionStatus === 'submitted' ? 'View Submission' : 'View & Submit'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b-4 border-blue-600 rounded-3xl mb-6 p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-gray-900 dark:text-white">
                Student Portal
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Welcome, {student.name}
              </p>
            </div>
            <Button variant="outline" onClick={onLogout} className="gap-2">
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </header>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading courses...</p>
          </div>
        ) : courses.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">You are not enrolled in any courses.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course, index) => (
              <Card
                key={course.course_id || `course-${index}`}
                className="hover:shadow-xl transition-all cursor-pointer transform hover:scale-105"
                onClick={() => setSelectedCourse(course)}
              >
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{course.code}</CardTitle>
                    </div>
                  </div>
                  <CardDescription className="text-base font-semibold">
                    {course.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {course.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

