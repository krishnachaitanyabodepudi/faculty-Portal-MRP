"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Users, BookOpen, FileText, GraduationCap, Plus, 
  LogOut, Loader2, ChevronDown, ChevronUp, Eye, EyeOff
} from "lucide-react"

interface Faculty {
  faculty_id: string
  name: string
  email: string
  department: string
  designation: string
  courses: Course[]
  courseCount: number
}

interface Course {
  course_id: string
  name: string
  code: string
  description: string
  duration: string
  strength: number
  syllabusContent?: string
}

interface AdminPortalProps {
  onLogout: () => void
}

export function AdminPortal({ onLogout }: AdminPortalProps) {
  const [faculty, setFaculty] = useState<Faculty[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedFaculty, setExpandedFaculty] = useState<Set<string>>(new Set())
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set())
  const [showAddCourse, setShowAddCourse] = useState(false)
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [courseName, setCourseName] = useState("")
  const [courseCode, setCourseCode] = useState("")
  const [courseDuration, setCourseDuration] = useState("12 weeks")
  const [courseStrength, setCourseStrength] = useState("")
  const [syllabusFile, setSyllabusFile] = useState<File | null>(null)
  const [assignmentQuestions, setAssignmentQuestions] = useState("")

  useEffect(() => {
    fetchFacultyData()
  }, [])

  const fetchFacultyData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/faculty')
      const data = await response.json()
      if (data.faculty) {
        setFaculty(data.faculty)
      }
    } catch (error) {
      console.error('Failed to fetch faculty data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleFaculty = (facultyId: string) => {
    const newExpanded = new Set(expandedFaculty)
    if (newExpanded.has(facultyId)) {
      newExpanded.delete(facultyId)
    } else {
      newExpanded.add(facultyId)
    }
    setExpandedFaculty(newExpanded)
  }

  const toggleCourse = (courseId: string) => {
    const newExpanded = new Set(expandedCourses)
    if (newExpanded.has(courseId)) {
      newExpanded.delete(courseId)
    } else {
      newExpanded.add(courseId)
    }
    setExpandedCourses(newExpanded)
  }

  const handleAddCourse = (faculty: Faculty) => {
    setSelectedFaculty(faculty)
    setShowAddCourse(true)
    // Reset form
    setCourseName("")
    setCourseCode("")
    setCourseDuration("12 weeks")
    setCourseStrength("")
    setSyllabusFile(null)
    setAssignmentQuestions("")
  }

  const handleSubmitCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFaculty) return

    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('name', courseName)
      formData.append('code', courseCode)
      formData.append('duration', courseDuration)
      formData.append('students', courseStrength)
      formData.append('faculty_id', selectedFaculty.faculty_id)
      if (syllabusFile) {
        formData.append('syllabus', syllabusFile)
      }
      if (assignmentQuestions) {
        formData.append('assignment_questions', assignmentQuestions)
      }

      const response = await fetch('/api/courses', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        // If assignment questions provided, create assignments
        if (assignmentQuestions && data.course?.course_id) {
          await createAssignments(data.course.course_id, assignmentQuestions)
        }

        setShowAddCourse(false)
        fetchFacultyData() // Refresh data
        alert(`Course added successfully! The course will now appear in ${selectedFaculty.name}'s course list when they log in.`)
      } else {
        alert(`Error: ${data.error || 'Failed to add course'}`)
      }
    } catch (error) {
      console.error('Error adding course:', error)
      alert('Failed to add course. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const createAssignments = async (courseId: string, questions: string) => {
    try {
      // Parse assignment questions - split by newlines and filter empty
      const questionLines = questions
        .split('\n')
        .map(line => {
          // Remove "Q1:", "Q2:", etc. prefixes if present
          return line.replace(/^Q\d+[:\-\.]\s*/i, '').trim()
        })
        .filter(line => line.length > 0)
      
      if (questionLines.length === 0) return

      const response = await fetch('/api/assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          courseId, 
          questions: questionLines 
        }),
      })

      const data = await response.json()
      if (data.success) {
        console.log(`Created ${data.assignments.length} assignments for course ${courseId}`)
      }
    } catch (error) {
      console.error('Error creating assignments:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-xl font-semibold text-gray-600 dark:text-gray-400">Loading admin portal...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white">Admin Portal</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Faculty & Course Management</p>
            </div>
          </div>
          <Button onClick={onLogout} variant="outline" className="gap-2 font-semibold">
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
              Faculty Overview
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Manage {faculty.length} faculty members and their courses
            </p>
          </div>
        </div>

        {/* Faculty List */}
        <div className="space-y-4">
          {faculty.map((fac) => (
            <Card key={fac.faculty_id} className="border-2 !bg-white dark:!bg-gray-900">
              <CardHeader className="cursor-pointer" onClick={() => toggleFaculty(fac.faculty_id)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
                      <Users className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                        {fac.name}
                      </CardTitle>
                      <div className="flex items-center gap-3 mt-1">
                        <Badge variant="outline" className="font-medium">
                          {fac.designation}
                        </Badge>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {fac.department}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-500">
                          {fac.email}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {fac.courseCount}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        Courses
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleAddCourse(fac)
                      }}
                      className="gap-2 font-semibold"
                    >
                      <Plus className="w-4 h-4" />
                      Add Course
                    </Button>
                    {expandedFaculty.has(fac.faculty_id) ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>
              </CardHeader>

              {expandedFaculty.has(fac.faculty_id) && (
                <CardContent className="pt-0">
                  {fac.courses.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      No courses assigned yet
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {fac.courses.map((course) => (
                        <Card key={course.course_id} className="border !bg-gray-50 dark:!bg-gray-800">
                          <CardHeader 
                            className="cursor-pointer pb-3"
                            onClick={() => toggleCourse(course.course_id)}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge className="bg-blue-600 text-white font-semibold">
                                    {course.code}
                                  </Badge>
                                  <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">
                                    {course.name}
                                  </CardTitle>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {course.duration} • {course.strength} students
                                </p>
                              </div>
                              {expandedCourses.has(course.course_id) ? (
                                <ChevronUp className="w-4 h-4 text-gray-400" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                              )}
                            </div>
                          </CardHeader>
                          {expandedCourses.has(course.course_id) && (
                            <CardContent className="pt-0">
                              <div className="space-y-3">
                                <div>
                                  <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    Description
                                  </Label>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    {course.description}
                                  </p>
                                </div>
                                {course.syllabusContent && (
                                  <div>
                                    <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                      <FileText className="w-4 h-4" />
                                      Syllabus Preview
                                    </Label>
                                    <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border max-h-48 overflow-y-auto">
                                      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                        {course.syllabusContent.substring(0, 500)}
                                        {course.syllabusContent.length > 500 && '...'}
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          )}
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </div>

      {/* Add Course Dialog */}
      <Dialog open={showAddCourse} onOpenChange={setShowAddCourse}>
        <DialogContent className="!max-w-3xl !bg-white dark:!bg-gray-900">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              Add Course for {selectedFaculty?.name}
            </DialogTitle>
            <DialogDescription className="text-base text-gray-600 dark:text-gray-400">
              Create a new course with syllabus and assignment questions
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitCourse} className="space-y-6 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="courseName" className="text-base font-semibold text-gray-900 dark:text-white">
                  Course Name *
                </Label>
                <Input
                  id="courseName"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  required
                  className="mt-2 h-12 font-medium"
                  placeholder="e.g., Introduction to Machine Learning"
                />
              </div>
              <div>
                <Label htmlFor="courseCode" className="text-base font-semibold text-gray-900 dark:text-white">
                  Course Code *
                </Label>
                <Input
                  id="courseCode"
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value.toUpperCase())}
                  required
                  className="mt-2 h-12 font-medium"
                  placeholder="e.g., CS101"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="courseDuration" className="text-base font-semibold text-gray-900 dark:text-white">
                  Duration *
                </Label>
                <Input
                  id="courseDuration"
                  value={courseDuration}
                  onChange={(e) => setCourseDuration(e.target.value)}
                  required
                  className="mt-2 h-12 font-medium"
                  placeholder="e.g., 12 weeks"
                />
              </div>
              <div>
                <Label htmlFor="courseStrength" className="text-base font-semibold text-gray-900 dark:text-white">
                  Number of Students *
                </Label>
                <Input
                  id="courseStrength"
                  type="number"
                  value={courseStrength}
                  onChange={(e) => setCourseStrength(e.target.value)}
                  required
                  className="mt-2 h-12 font-medium"
                  placeholder="e.g., 45"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="syllabus" className="text-base font-semibold text-gray-900 dark:text-white">
                Upload Syllabus PDF *
              </Label>
              <Input
                id="syllabus"
                type="file"
                accept=".pdf"
                onChange={(e) => setSyllabusFile(e.target.files?.[0] || null)}
                required
                className="mt-2 h-12 font-medium"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                PDF syllabus will be extracted and stored automatically
              </p>
            </div>

            <div>
              <Label htmlFor="assignmentQuestions" className="text-base font-semibold text-gray-900 dark:text-white">
                Assignment Questions (Optional)
              </Label>
              <Textarea
                id="assignmentQuestions"
                value={assignmentQuestions}
                onChange={(e) => setAssignmentQuestions(e.target.value)}
                className="mt-2 min-h-32 font-medium"
                placeholder="Enter assignment questions, one per line or separated by newlines.&#10;Example:&#10;Q1: Explain machine learning concepts&#10;Q2: Implement a neural network"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Add assignment questions that will be created for this course
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddCourse(false)}
                className="font-semibold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="font-semibold gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Adding Course...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Add Course
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

