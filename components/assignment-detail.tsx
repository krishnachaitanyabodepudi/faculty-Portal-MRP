"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, FileText, HelpCircle, Calendar, ClipboardList } from "lucide-react"
import { Badge } from "@/components/ui/badge"

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

interface AssignmentDetailProps {
  assignment: Assignment
  course: Course
  onBack: () => void
}

interface Rubric {
  rubric_id: string
  assignment_id: string
  criterion_name: string
  weight: number
  description: string
  indicators: string[]
}

export function AssignmentDetail({ assignment, course, onBack }: AssignmentDetailProps) {
  const [assignmentDetails, setAssignmentDetails] = useState<any>(null)
  const [rubric, setRubric] = useState<Rubric[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchAssignmentDetails()
    fetchRubric()
  }, [assignment.id, course.id])

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
    } finally {
      setIsLoading(false)
    }
  }

  const fetchRubric = async () => {
    try {
      const response = await fetch(`/api/rubrics?assignment_id=${assignment.id}`)
      const data = await response.json()
      
      if (data.rubrics) {
        setRubric(data.rubrics)
      }
    } catch (error) {
      console.error('Failed to fetch rubric:', error)
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
            {assignmentDetails?.due_date && (
              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Due: {new Date(assignmentDetails.due_date).toLocaleDateString()}</span>
              </div>
            )}
            {assignmentDetails?.max_score && (
              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                <span>Max Score: {assignmentDetails.max_score} points</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Assignment Question & Instructions */}
      {assignmentDetails && (
        <Card className="border-2 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-blue-500" />
              Assignment Question & Instructions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2 text-base">Description & Requirements</h4>
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                {assignmentDetails.description}
              </p>
            </div>
            {assignmentDetails.deliverables && assignmentDetails.deliverables.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 text-base">Deliverables</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
                  {assignmentDetails.deliverables.map((deliverable: string, idx: number) => (
                    <li key={idx}>{deliverable}</li>
                  ))}
                </ul>
              </div>
            )}
            {assignmentDetails.submission_instructions && (
              <div>
                <h4 className="font-semibold mb-2 text-base">Submission Instructions</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {assignmentDetails.submission_instructions}
                </p>
              </div>
            )}
            {assignmentDetails.formatting_requirements && (
              <div>
                <h4 className="font-semibold mb-2 text-base">Formatting Requirements</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {assignmentDetails.formatting_requirements}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Rubric */}
      <Card className="border-2 border-purple-200 dark:border-purple-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-purple-500" />
            Grading Rubric
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="inline-block w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
              <p className="mt-4 text-muted-foreground">Loading rubric...</p>
            </div>
          ) : rubric.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No rubric available for this assignment.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {rubric.map((criterion, index) => (
                <div
                  key={criterion.rubric_id || index}
                  className="border-l-4 border-purple-500 pl-4 py-3 bg-purple-50 dark:bg-purple-950/20 rounded-r-lg"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-base text-gray-900 dark:text-white">
                      {criterion.criterion_name}
                    </h4>
                    <Badge variant="outline" className="ml-2">
                      {criterion.weight}%
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                    {criterion.description}
                  </p>
                  {criterion.indicators && criterion.indicators.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                        Indicators:
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-xs text-gray-600 dark:text-gray-400">
                        {criterion.indicators.map((indicator: string, idx: number) => (
                          <li key={idx}>{indicator}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
