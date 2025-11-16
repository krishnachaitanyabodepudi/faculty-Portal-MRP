"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Upload, CheckCircle, X, FileText, LogOut, Eye } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Student {
  id: string
  email: string
  name: string
  enrolled_courses: string[]
  role: string
}

interface Assignment {
  assignment_id: string
  course_id: string
  title: string
  description: string
  due_date: string
  max_score: number
}

interface Course {
  course_id: string
  name: string
  code: string
}

interface StudentAssignmentViewProps {
  assignment: Assignment
  course: Course
  student: Student
  onBack: () => void
  onLogout: () => void
}

export function StudentAssignmentView({
  assignment,
  course,
  student,
  onBack,
  onLogout
}: StudentAssignmentViewProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [error, setError] = useState("")
  const [existingSubmission, setExistingSubmission] = useState<any>(null)
  const [isLoadingSubmission, setIsLoadingSubmission] = useState(true)

  useEffect(() => {
    fetchExistingSubmission()
  }, [assignment.assignment_id, course.course_id, student.id])

  const fetchExistingSubmission = async () => {
    setIsLoadingSubmission(true)
    try {
      const response = await fetch(
        `/api/submissions?course_id=${course.course_id}&assignment_id=${assignment.assignment_id}`
      )
      const data = await response.json()
      
      if (data.submissions) {
        // Find submission matching the current student's ID
        // The API already maps student_id to real names from students dataset
        const studentSubmission = data.submissions.find(
          (sub: any) => sub.student_id === student.id
        )
        
        if (studentSubmission) {
          // Ensure we have the correct student name from the API response
          // The API already maps it from students dataset
          setExistingSubmission({
            ...studentSubmission,
            student_name: studentSubmission.student_name || student.name,
            student_id: studentSubmission.student_id || student.id
          })
        } else {
          setExistingSubmission(null)
        }
      }
    } catch (error) {
      console.error('Failed to fetch existing submission:', error)
    } finally {
      setIsLoadingSubmission(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setUploadSuccess(false)
      setError("")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!file) {
      setError("Please select a file to upload")
      return
    }

    setIsUploading(true)
    setError("")

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('course_id', course.course_id)
      formData.append('assignment_id', assignment.assignment_id)
      formData.append('student_id', student.id)
      formData.append('student_name', student.name)

      const response = await fetch('/api/submissions/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        setUploadSuccess(true)
        setFile(null)
        // Reset file input
        const fileInput = document.getElementById('file-input') as HTMLInputElement
        if (fileInput) fileInput.value = ''
        // Refresh submission status
        await fetchExistingSubmission()
      } else {
        setError(data.error || "Failed to upload submission")
      }
    } catch (err) {
      setError("Failed to upload submission. Please try again.")
      console.error('Upload error:', err)
    } finally {
      setIsUploading(false)
    }
  }

  const isPastDue = new Date(assignment.due_date) < new Date()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={onBack}>
            ← Back to Assignments
          </Button>
          <Button variant="outline" onClick={onLogout} className="gap-2">
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl mb-2">{assignment.title}</CardTitle>
                <CardDescription className="text-base">
                  {course.name} ({course.code})
                </CardDescription>
              </div>
              <div className={`px-4 py-2 rounded-xl font-semibold ${
                isPastDue 
                  ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' 
                  : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              }`}>
                {isPastDue ? 'Past Due' : 'Active'}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Due Date
              </Label>
              <p className="text-gray-600 dark:text-gray-400">
                {new Date(assignment.due_date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <div>
              <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Maximum Score
              </Label>
              <p className="text-gray-600 dark:text-gray-400">{assignment.max_score} points</p>
            </div>
            <div>
              <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Assignment Description
              </Label>
              <div className="mt-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {assignment.description}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {existingSubmission && (
          <Card className="mb-6 border-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                <CheckCircle className="w-5 h-5" />
                Submission Already Submitted
              </CardTitle>
              <CardDescription>
                You have already submitted this assignment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Submitted File: {existingSubmission.filename}
                    </p>
                    {existingSubmission.submitted_at && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Submitted on: {new Date(existingSubmission.submitted_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <Badge className="bg-green-600 hover:bg-green-700">
                    Submitted
                  </Badge>
                </div>
                {existingSubmission.path && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const pdfUrl = `/api/submissions/pdf?course_id=${course.course_id}&assignment_id=${assignment.assignment_id}&filename=${existingSubmission.filename}`
                      window.open(pdfUrl, '_blank')
                    }}
                    className="gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    View Submitted File
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              {existingSubmission ? 'Resubmit Assignment' : 'Submit Assignment'}
            </CardTitle>
            <CardDescription>
              {existingSubmission 
                ? 'Upload a new file to replace your existing submission (PDF, DOC, DOCX, or TXT)'
                : 'Upload your completed assignment file (PDF, DOC, DOCX, or TXT)'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="file-input" className="text-base font-semibold">
                  Select File
                </Label>
                <Input
                  id="file-input"
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileChange}
                  className="mt-2 h-12 cursor-pointer"
                  disabled={isUploading}
                />
                {file && (
                  <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                        {file.name} ({(file.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-950/30 border-2 border-red-200 dark:border-red-800 rounded-xl">
                  <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                    <X className="w-5 h-5" />
                    <span className="font-medium">{error}</span>
                  </div>
                </div>
              )}

              {uploadSuccess && (
                <div className="p-4 bg-green-50 dark:bg-green-950/30 border-2 border-green-200 dark:border-green-800 rounded-xl">
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Submission uploaded successfully!</span>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                disabled={!file || isUploading || uploadSuccess}
                className="w-full h-12 text-base font-semibold gap-2"
              >
                {isUploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Submit Assignment
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


