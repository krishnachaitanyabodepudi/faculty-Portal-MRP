"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Sparkles, Loader2, FileText } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Assignment {
  id: string
  name: string
  title: string
}

interface Submission {
  id: string
  studentName: string
  studentId: string
  pdfUrl?: string
  submittedDate?: string
}

interface FeedbackAnalysisDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  assignment: Assignment
  submissions: Submission[]
}

export function FeedbackAnalysisDialog({ open, onOpenChange, assignment, submissions }: FeedbackAnalysisDialogProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResults, setAnalysisResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [showRubric, setShowRubric] = useState(false)
  const [rubricData, setRubricData] = useState<any[]>([])

  const fetchRubric = async () => {
    try {
      const rubricResponse = await fetch(`/api/rubrics?assignment_id=${assignment.id}`)
      const rubricData = await rubricResponse.json()
      if (rubricData.rubrics && rubricData.rubrics.length > 0) {
        setRubricData(rubricData.rubrics)
        return rubricData.rubrics
      }
      return []
    } catch (error) {
      console.error('Failed to fetch rubric:', error)
      return []
    }
  }

  const handleAnalyze = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    setIsAnalyzing(true)
    setError(null)

    try {
      // Fetch rubric
      const rubricList = await fetchRubric()
      let rubricText = ""
      if (rubricList.length > 0) {
        rubricText = rubricList.map((r: any) => 
          `${r.criterion_name} (${r.weight}%): ${r.description}\nIndicators: ${r.indicators.join('; ')}`
        ).join('\n\n')
      } else {
        rubricText = "Standard academic grading criteria: Understanding of Concepts (25%), Application and Analysis (30%), Quality of Writing (20%), Use of Sources (15%), Completeness (10%)"
      }

      // Fetch all students to map IDs to names
      let studentsMap = new Map<string, string>()
      try {
        const studentsResponse = await fetch('/api/students')
        const studentsData = await studentsResponse.json()
        if (studentsData.students) {
          studentsData.students.forEach((student: any) => {
            studentsMap.set(student.student_id, student.name)
          })
        }
      } catch (error) {
        console.error('Failed to fetch students:', error)
      }

      // Ensure submissions have all required fields with real student names
      const formattedSubmissions = submissions.map((sub: any) => {
        const studentId = sub.studentId || sub.id
        const realStudentName = studentId && studentsMap.has(studentId)
          ? studentsMap.get(studentId)!
          : (sub.studentName || `Student ${studentId?.replace('S', '') || 'Unknown'}`)
        
        return {
          id: sub.id || sub.studentId,
          studentName: realStudentName,
          studentId: studentId,
          content: sub.content || `${realStudentName} submitted their assignment.`,
          pdfUrl: sub.pdfUrl || sub.fileUrl,
          submittedDate: sub.submittedAt || sub.submittedDate,
        }
      })

      const submissionsData = formattedSubmissions.map((sub: any) => ({
        studentName: sub.studentName,
        studentId: sub.studentId,
        submissionText: sub.content || `Student ${sub.studentName} submitted their assignment.`,
      }))

      // Call the analysis API directly
      const response = await fetch("/api/analyze-assignment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rubric: rubricText,
          submissions: submissionsData,
          assignmentName: `${assignment.name}: ${assignment.title}`,
          courseId: (assignment as any).courseId,
        }),
      })

      // Check response status and handle errors
      const contentType = response.headers.get("content-type")
      const isJson = contentType && contentType.includes("application/json")
      
      if (!response.ok) {
        let errorMessage = "Analysis failed"
        try {
          if (isJson) {
            const errorData = await response.json()
            errorMessage = errorData.error || errorData.message || errorMessage
          } else {
            const errorText = await response.text()
            errorMessage = errorText || errorMessage
          }
          
          // Handle API key errors
          if (errorMessage.includes("GEMINI_API_KEY") || errorMessage.includes("API key")) {
            errorMessage = `API Key Required\n\n${errorMessage}\n\nTo fix this:\n1. Get your API key from https://aistudio.google.com/app/apikey\n2. Create a .env.local file in your project root\n3. Add: GEMINI_API_KEY=your_api_key_here\n4. Restart your development server`
          }
        } catch (parseError) {
          errorMessage = `HTTP ${response.status}: Analysis failed. Please check your API configuration.`
        }
        throw new Error(errorMessage)
      }

      const results = await response.json()
      
      // Check for errors in response
      if (results.error) {
        throw new Error(results.error)
      }
      
      // Add submission data for PDF generation
      const enhancedResults = {
        ...results,
        studentScores: results.studentScores.map((score: any, idx: number) => ({
          ...score,
          pdfUrl: formattedSubmissions[idx]?.pdfUrl,
          submissionText: formattedSubmissions[idx]?.content,
          fileUrl: formattedSubmissions[idx]?.fileUrl,
        })),
      }

      setAnalysisResults(enhancedResults)
    } catch (error: any) {
      console.error("Analysis error:", error)
      const errorMessage = error?.message || "Failed to analyze submissions. Please try again."
      setError(errorMessage)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleViewRubric = async () => {
    if (rubricData.length === 0) {
      const fetched = await fetchRubric()
      if (fetched.length === 0) {
        setError('No rubric found for this assignment')
        return
      }
    }
    setShowRubric(true)
  }

  const handleReset = () => {
    setAnalysisResults(null)
    setError(null)
    setShowRubric(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="!max-w-4xl !w-[calc(100vw-2rem)] !max-h-[90vh] !p-0 !gap-0 !overflow-hidden !flex !flex-col !bg-white dark:!bg-gray-900 !opacity-100"
      >
        <div className="flex-shrink-0 px-6 pt-6 pb-4 border-b !bg-white dark:!bg-gray-900 z-10 opacity-100">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
              <Sparkles className="w-6 h-6 text-blue-600" />
              Feedback Analysis (Powered by Gemini)
            </DialogTitle>
            <DialogDescription className="text-base font-medium text-gray-600 dark:text-gray-400">
              Analyze {submissions.length} submissions for {assignment.name}: {assignment.title}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 min-h-0 relative !bg-white dark:!bg-gray-900 opacity-100">
          {showRubric ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Grading Rubric</h3>
                <Button variant="outline" size="sm" onClick={() => setShowRubric(false)} className="font-medium">
                  Back
                </Button>
              </div>
              {rubricData.length > 0 ? (
                <div className="space-y-4">
                  {rubricData.map((rubric: any, idx: number) => (
                    <Card key={idx} className="border-2 !bg-white dark:!bg-gray-800">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-bold text-lg text-gray-900 dark:text-white">{rubric.criterion_name}</h4>
                          <Badge className="bg-blue-600 text-white font-semibold px-3 py-1">{rubric.weight}%</Badge>
                        </div>
                        <p className="text-base text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">{rubric.description}</p>
                        <div>
                          <p className="text-sm font-bold text-gray-600 dark:text-gray-400 mb-2">Indicators:</p>
                          <ul className="list-disc list-inside space-y-2">
                            {rubric.indicators.map((indicator: string, i: number) => (
                              <li key={i} className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{indicator}</li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="border-2 !bg-white dark:!bg-gray-800">
                  <CardContent className="p-6 text-center">
                    <p className="text-base text-gray-600 dark:text-gray-400 font-medium">No rubric found for this assignment.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : isAnalyzing ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
              <h3 className="text-xl font-bold mb-2">Analyzing Submissions</h3>
              <p className="text-muted-foreground text-center">
                Please wait while we analyze {submissions.length} student submissions...
              </p>
            </div>
          ) : !analysisResults ? (
            <div className="space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-950/30 border-2 border-red-200 dark:border-red-800 rounded-lg p-5">
                <p className="text-base text-red-700 dark:text-red-300 font-bold mb-2">Error</p>
                <p className="text-sm text-red-600 dark:text-red-400 leading-relaxed mb-3">{error}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2 font-medium"
                  onClick={() => setError(null)}
                >
                  Dismiss
                </Button>
              </div>
            )}
            <div className="bg-blue-50 dark:bg-blue-950/30 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-5">
              <p className="text-base text-gray-700 dark:text-gray-300 mb-4 leading-relaxed font-medium">
                The grading rubric will be automatically loaded from the dataset for this assignment. 
                Click the button below to start analyzing {submissions.length} student submissions.
              </p>
              <Button 
                variant="outline" 
                onClick={handleViewRubric}
                className="gap-2 font-semibold"
              >
                <FileText className="w-4 h-4" />
                View Rubric
              </Button>
            </div>
          </div>
          ) : (
            <div className="space-y-6">
            <Card className="border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Overall Analysis</h3>
                  <Badge className="text-lg px-4 py-1 bg-blue-600">{analysisResults.overallScore}%</Badge>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-green-600 dark:text-green-400 mb-2">Strengths</h4>
                    <ul className="space-y-1">
                      {(analysisResults.strengths || []).map((strength: string, idx: number) => (
                        <li key={idx} className="text-sm text-muted-foreground">
                          ✓ {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-orange-600 dark:text-orange-400 mb-2">Areas for Improvement</h4>
                    <ul className="space-y-1">
                      {(analysisResults.improvements || []).map((improvement: string, idx: number) => (
                        <li key={idx} className="text-sm text-muted-foreground">
                          • {improvement}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div>
              <h3 className="text-lg font-semibold mb-4">Individual Student Results</h3>
              <div className="space-y-3">
                {analysisResults.studentScores.map((result: any, idx: number) => (
                  <Card key={idx} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <span className="font-semibold">{result.studentName}</span>
                          <span className="text-sm text-muted-foreground ml-2">({result.studentId})</span>
                        </div>
                        <Badge
                          className={
                            result.score >= 80 ? "bg-green-600" : result.score >= 60 ? "bg-yellow-600" : "bg-red-600"
                          }
                        >
                          {(typeof result.score === 'number' ? result.score : 0).toFixed(1)}%
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3 whitespace-pre-wrap">{result.feedback}</p>
                      <div className="flex items-center justify-between pt-3 border-t">
                        <span className="text-sm text-orange-600 dark:text-orange-400 font-medium">
                          {result.errorsMarked} errors marked in PDF
                        </span>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="gap-2"
                          onClick={async () => {
                            try {
                              const response = await fetch('/api/analyze-assignment/generate-pdf', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  courseId: (assignment as any).courseId,
                                  assignmentId: assignment.id,
                                  studentId: result.studentId,
                                  studentName: result.studentName,
                                  submissionText: result.submissionText || '',
                                  feedback: result.feedback || '',
                                  score: result.score || 0,
                                  errors: result.improvements || [],
                                  originalPdfPath: result.fileUrl || result.pdfUrl,
                                }),
                              })

                              if (!response.ok) {
                                throw new Error('Failed to generate PDF')
                              }

                              const blob = await response.blob()
                              const url = window.URL.createObjectURL(blob)
                              const a = document.createElement('a')
                              a.href = url
                              a.download = `annotated_${result.studentName}_${result.studentId}.pdf`
                              document.body.appendChild(a)
                              a.click()
                              window.URL.revokeObjectURL(url)
                              document.body.removeChild(a)
                            } catch (error) {
                              console.error('Error downloading PDF:', error)
                              alert('Failed to download annotated PDF. Please try again.')
                            }
                          }}
                        >
                          <FileText className="w-4 h-4" />
                          Download Annotated PDF
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
          )}
        </div>

        <div className="flex-shrink-0 px-6 py-4 border-t !bg-white dark:!bg-gray-900 z-10 opacity-100">
          {!analysisResults && !showRubric ? (
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => onOpenChange(false)} className="font-semibold">
                Cancel
              </Button>
              <Button 
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleAnalyze()
                }} 
                disabled={isAnalyzing} 
                className="gap-2 font-semibold"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Analyze Submissions
                  </>
                )}
              </Button>
            </div>
          ) : showRubric ? (
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowRubric(false)} className="font-semibold">
                Back
              </Button>
              <Button 
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleAnalyze()
                }} 
                disabled={isAnalyzing} 
                className="gap-2 font-semibold"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Analyze Submissions
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={handleReset} className="font-semibold">
                New Analysis
              </Button>
              <Button onClick={() => onOpenChange(false)} className="font-semibold">Done</Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
