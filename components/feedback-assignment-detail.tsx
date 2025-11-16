"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, User, FileText, Sparkles, Eye, Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { FeedbackAnalysisDialog } from "@/components/feedback-analysis-dialog"

interface Assignment {
  id: string
  name: string
  title: string
  submissions: number
  totalStudents: number
  description?: string
  deliverables?: string[]
  dueDate?: string
}

interface Course {
  id: string
  name: string
  code: string
}

interface FeedbackAssignmentDetailProps {
  assignment: Assignment
  course: Course
  onBack: () => void
}

interface Submission {
  id: string
  studentName: string
  studentId: string
  submittedAt: string
  status: "submitted" | "late" | "pending"
  fileUrl?: string
  content?: string
}

export function FeedbackAssignmentDetail({ assignment, course, onBack }: FeedbackAssignmentDetailProps) {
  const [showAnalysisDialog, setShowAnalysisDialog] = useState(false)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [assignmentDetails, setAssignmentDetails] = useState<any>(null)

  useEffect(() => {
    fetchSubmissions()
    fetchAssignmentDetails()
  }, [assignment.id, course.id])

  const fetchSubmissions = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/submissions?course_id=${course.id}&assignment_id=${assignment.id}`)
      const data = await response.json()
      
      if (data.submissions) {
        // Fetch all students to map IDs to names
        const studentsResponse = await fetch('/api/students')
        const studentsData = await studentsResponse.json()
        const studentsMap = new Map<string, string>()
        if (studentsData.students) {
          studentsData.students.forEach((student: any) => {
            studentsMap.set(student.student_id, student.name)
          })
        }
        
        const subs: Submission[] = data.submissions.map((sub: any, index: number) => {
          // Get real student name from students dataset
          const realStudentName = sub.student_id && studentsMap.has(sub.student_id) 
            ? studentsMap.get(sub.student_id)! 
            : (sub.student_name || `Student ${sub.student_id?.replace('S', '') || index + 1}`)
          
          // Use metadata if available (new student submissions)
          if (sub.student_id) {
            return {
              id: sub.student_id,
              studentName: realStudentName,
              studentId: sub.student_id,
              submittedAt: sub.submitted_at ? new Date(sub.submitted_at).toLocaleString() : new Date().toLocaleString(),
              status: "submitted" as const,
              fileUrl: sub.path,
              content: sub.content
            }
          }
          // Fallback to old format
          const submissionNum = sub.filename.match(/sub(\d+)/)?.[1] || String(index + 1)
          const studentId = `S${submissionNum.padStart(3, '0')}`
          const fallbackName = studentsMap.has(studentId) 
            ? studentsMap.get(studentId)! 
            : `Student ${submissionNum.padStart(2, '0')}`
          
          return {
            id: submissionNum,
            studentName: fallbackName,
            studentId: studentId,
            submittedAt: new Date().toLocaleString(),
            status: "submitted" as const,
            fileUrl: sub.path,
            content: sub.content
          }
        })
        setSubmissions(subs)
      }
    } catch (error) {
      console.error('Failed to fetch submissions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAssignmentDetails = async () => {
    try {
      const response = await fetch(`/api/assignments?course_id=${course.id}`)
      const data = await response.json()
      
      if (data.assignments) {
        const assignmentData = data.assignments.find((a: any) => a.assignment_id === assignment.id)
        if (assignmentData) {
          setAssignmentDetails(assignmentData)
        }
      }
    } catch (error) {
      console.error('Failed to fetch assignment details:', error)
    }
  }

  const handleViewPDF = (submission: Submission) => {
    // For new student submissions, use the actual filename from fileUrl
    if (submission.fileUrl) {
      const filename = submission.fileUrl.split(/[\\/]/).pop() || ''
      // Check if it's a PDF or we need to find the PDF version
      if (filename.endsWith('.pdf')) {
        const pdfUrl = `/api/submissions/pdf?course_id=${course.id}&assignment_id=${assignment.id}&filename=${filename}`
        window.open(pdfUrl, '_blank')
      } else if (filename.endsWith('.txt')) {
        // For text files, try to find corresponding PDF
        const pdfFilename = filename.replace('.txt', '.pdf')
        const pdfUrl = `/api/submissions/pdf?course_id=${course.id}&assignment_id=${assignment.id}&filename=${pdfFilename}`
        window.open(pdfUrl, '_blank')
      } else {
        // Fallback: try to open the file directly
        const fileUrl = `/api/submissions/pdf?course_id=${course.id}&assignment_id=${assignment.id}&filename=${filename}`
        window.open(fileUrl, '_blank')
      }
    } else {
      // Old format: Extract submission number from filename
      const submissionNum = submission.id.padStart(2, '0')
      const filename = `sub${submissionNum}.pdf`
      const pdfUrl = `/api/submissions/pdf?course_id=${course.id}&assignment_id=${assignment.id}&filename=${filename}`
      window.open(pdfUrl, '_blank')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge>{assignment.name}</Badge>
              <h2 className="text-2xl font-bold">{assignment.title}</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              {submissions.length} submissions from {assignment.totalStudents} students
            </p>
            {assignmentDetails?.due_date && (
              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Due: {new Date(assignmentDetails.due_date).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>
        <Button onClick={() => setShowAnalysisDialog(true)} className="gap-2 shadow-lg" disabled={submissions.length === 0}>
          <Sparkles className="w-4 h-4" />
          Analyze Feedback
        </Button>
      </div>

      {/* Student Submissions */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-500" />
            Student Submissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="mt-4 text-muted-foreground">Loading submissions...</p>
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No submissions received for this assignment yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {submissions.map((submission) => (
                <Card key={submission.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{submission.studentName}</h4>
                          <p className="text-sm text-muted-foreground">ID: {submission.studentId}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewPDF(submission)}
                          className="gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          View PDF
                        </Button>
                        <div className="text-right">
                          <Badge
                            variant={submission.status === "late" ? "destructive" : "default"}
                            className={submission.status === "submitted" ? "bg-green-500 hover:bg-green-600" : ""}
                          >
                            {submission.status}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">{submission.submittedAt}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <FeedbackAnalysisDialog
        open={showAnalysisDialog}
        onOpenChange={setShowAnalysisDialog}
        assignment={{
          id: assignment.id,
          name: assignment.name,
          title: assignment.title,
          courseId: course.id
        } as any}
        submissions={submissions}
      />
    </div>
  )
}

