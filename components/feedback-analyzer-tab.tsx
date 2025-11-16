"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, ChevronRight } from "lucide-react"
import { FeedbackAssignmentDetail } from "@/components/feedback-assignment-detail"
import { Badge } from "@/components/ui/badge"

interface Course {
  id: string
  name: string
  code: string
}

interface FeedbackAnalyzerTabProps {
  course: Course
}

interface Assignment {
  id: string
  name: string
  title: string
  submissions: number
  totalStudents: number
  dueDate: string
}

export function FeedbackAnalyzerTab({ course }: FeedbackAnalyzerTabProps) {
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
  const [assignmentsList, setAssignmentsList] = useState<Assignment[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchAssignments()
  }, [course.id])

  const fetchAssignments = async () => {
    try {
      const response = await fetch(`/api/assignments?course_id=${course.id}`)
      const data = await response.json()
      
      if (data.assignments) {
        // Fetch submission counts for each assignment
        const assignmentsWithCounts = await Promise.all(
          data.assignments.map(async (a: any, index: number) => {
            try {
              const submissionsResponse = await fetch(`/api/submissions?course_id=${course.id}&assignment_id=${a.assignment_id}`)
              const submissionsData = await submissionsResponse.json()
              const submissionCount = submissionsData.submissions?.length || 0
              
              return {
                id: a.assignment_id,
                name: `Assignment ${index + 1}`,
                title: a.title,
                submissions: submissionCount,
                totalStudents: 45, // Course strength
                dueDate: a.due_date
              }
            } catch (error) {
              console.error(`Error fetching submissions for ${a.assignment_id}:`, error)
              return {
                id: a.assignment_id,
                name: `Assignment ${index + 1}`,
                title: a.title,
                submissions: 0,
                totalStudents: 45,
                dueDate: a.due_date
              }
            }
          })
        )
        
        setAssignmentsList(assignmentsWithCounts)
      }
    } catch (error) {
      console.error('Failed to fetch assignments:', error)
    } finally {
      setIsLoading(false)
    }
  }


  if (selectedAssignment) {
    return (
      <FeedbackAssignmentDetail assignment={selectedAssignment} course={course} onBack={() => setSelectedAssignment(null)} />
    )
  }

  return (
    <div className="space-y-6">
      <Card className="border-2">
        <CardHeader>
          <div>
            <CardTitle>Assignment Feedback Analyzer</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Select an assignment to view student submissions and analyze feedback
            </p>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="mt-4 text-muted-foreground">Loading assignments...</p>
            </div>
          ) : assignmentsList.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No assignments available for this course</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assignmentsList.map((assignment) => (
              <Card
                key={assignment.id}
                className="cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-blue-300 dark:hover:border-blue-700 group"
                onClick={() => setSelectedAssignment(assignment)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <Badge className="mb-1">{assignment.name}</Badge>
                        <h3 className="font-semibold text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {assignment.title}
                        </h3>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Submissions</span>
                      <span className="font-semibold">
                        {assignment.submissions}/{assignment.totalStudents}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-blue-500"
                        style={{
                          width: `${(assignment.submissions / assignment.totalStudents) * 100}%`,
                        }}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Due: {new Date(assignment.dueDate).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
