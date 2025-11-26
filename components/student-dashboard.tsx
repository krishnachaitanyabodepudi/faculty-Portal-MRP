"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, LogOut, FileText, Upload, CheckCircle, Clock, Mail } from "lucide-react"
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
  const [announcements, setAnnouncements] = useState<
    {
      id: string
      title: string
      message: string
      courseId?: string | null
      createdAt: string
      senderRole: "faculty" | "student"
      senderName?: string | null
      target: "students" | "faculty" | "all"
      toEmail?: string | null
    }[]
  >([])
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [toEmail, setToEmail] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [courseTab, setCourseTab] = useState<"assignments" | "announcements">("assignments")
  const [courseAnnouncements, setCourseAnnouncements] = useState<
    {
      id: string
      title: string
      message: string
      courseId?: string | null
      createdAt: string
      senderRole: "faculty" | "student"
      senderName?: string | null
      target: "students" | "faculty" | "all"
    }[]
  >([])

  useEffect(() => {
    fetchCourses()
    fetchAnnouncements()
  }, [student])

  useEffect(() => {
    if (selectedCourse) {
      fetchAssignments(selectedCourse.course_id)
      fetchCourseAnnouncements(selectedCourse.course_id)
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

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch("/api/announcements")
      const data = await res.json()
      if (data.announcements) {
        const visible = data.announcements.filter((a: any) => {
          const isOwnMessage = a.senderId === student.id
          const addressedToMe = a.toEmail && a.toEmail === student.email
          return isOwnMessage || addressedToMe
        })
        setAnnouncements(visible)
      }
    } catch (error) {
      console.error("Failed to fetch announcements:", error)
    }
  }

  const fetchCourseAnnouncements = async (courseId: string) => {
    try {
      const res = await fetch(`/api/announcements?course_id=${courseId}`)
      const data = await res.json()
      if (data.announcements) {
        const visible = data.announcements.filter(
          (a: any) => a.target === "students" || a.target === "all"
        )
        setCourseAnnouncements(visible)
      }
    } catch (error) {
      console.error("Failed to fetch course announcements:", error)
    }
  }

  const handleSendMessage = async () => {
    if (!toEmail.trim() || !subject.trim() || !message.trim()) {
      return
    }
    setIsSending(true)
    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: subject.trim(),
          message: message.trim(),
          senderRole: "student",
          senderId: student.id,
          senderName: student.name,
          target: "faculty",
          toEmail: toEmail.trim(),
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to send message")
      }
      setSubject("")
      setMessage("")
      setToEmail("")
      await fetchAnnouncements()
    } catch (error) {
      console.error("Failed to send message:", error)
      alert("Failed to send message. Please try again.")
    } finally {
      setIsSending(false)
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

          <div className="mb-4 flex gap-2">
            <Button
              variant={courseTab === "assignments" ? "default" : "outline"}
              size="sm"
              onClick={() => setCourseTab("assignments")}
              className="gap-1"
            >
              <FileText className="w-4 h-4" />
              Assignments
            </Button>
            <Button
              variant={courseTab === "announcements" ? "default" : "outline"}
              size="sm"
              onClick={() => setCourseTab("announcements")}
              className="gap-1"
            >
              <Mail className="w-4 h-4" />
              Announcements
            </Button>
          </div>

          {courseTab === "assignments" ? (
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
          ) : (
            <div className="grid gap-4">
              {courseAnnouncements.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-gray-500">No announcements have been posted for this course yet.</p>
                  </CardContent>
                </Card>
              ) : (
                courseAnnouncements.map((a) => (
                  <Card key={a.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg">{a.title}</CardTitle>
                      <CardDescription className="text-xs text-gray-500">
                        {new Date(a.createdAt).toLocaleString()}
                        {a.senderName && ` • ${a.senderName}`}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {a.message}
                      </p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
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
          <div className="grid lg:grid-cols-[2fr,1fr] gap-6">
            <div className="grid md:grid-cols-2 gap-6">
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

            <Card className="h-full flex flex-col">
              <CardHeader>
                <div className="flex items-center gap-2 mb-1">
                  <Mail className="w-4 h-4 text-blue-600" />
                  <CardTitle className="text-base">Mailbox</CardTitle>
                </div>
                <CardDescription className="text-sm">
                  Two-way messages between you and faculty.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col gap-4">
                <div className="space-y-2">
                  <p className="text-xs text-gray-500">
                    Compose a mail to your faculty or support.
                  </p>
                  <input
                    className="w-full border rounded-md px-2 py-1 text-sm mb-2 bg-background"
                    placeholder="Recipient email"
                    value={toEmail}
                    onChange={(e) => setToEmail(e.target.value)}
                  />
                  <input
                    className="w-full border rounded-md px-2 py-1 text-sm mb-2 bg-background"
                    placeholder="Subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                  <textarea
                    className="w-full border rounded-md px-2 py-1 text-sm bg-background"
                    placeholder="Write your message to faculty..."
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                  <div className="flex justify-end mt-2">
                    <Button
                      size="sm"
                      disabled={
                        isSending ||
                        !toEmail.trim() ||
                        !subject.trim() ||
                        !message.trim()
                      }
                      onClick={handleSendMessage}
                      className="gap-1"
                    >
                      {isSending ? "Sending..." : "Send"}
                    </Button>
                  </div>
                </div>

                <div className="border-t pt-3 mt-2">
                  {announcements.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      No messages yet. When faculty or you send messages, they will appear here.
                    </p>
                  ) : (
                    <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                      {announcements.map((a) => (
                        <div
                          key={a.id}
                          className="border rounded-md p-3 bg-white/80 dark:bg-gray-900/60"
                        >
                          <p className="text-sm font-semibold mb-1">{a.title}</p>
                          <p className="text-xs text-gray-500 mb-1">
                            {new Date(a.createdAt).toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500 mb-1">
                            {a.senderRole === "faculty" ? "From faculty" : "From you"}
                            {a.senderName && a.senderRole === "faculty" && ` • ${a.senderName}`}
                            {a.toEmail && ` → ${a.toEmail}`}
                          </p>
                          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                            {a.message}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

