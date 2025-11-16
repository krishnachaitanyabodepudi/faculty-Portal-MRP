"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Plus, X, ClipboardList } from "lucide-react"

interface RubricCriterion {
  criterion_name: string
  weight: string
  description: string
  indicators: string
}

interface AddAssignmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  courseId: string
  onSuccess: () => void
}

export function AddAssignmentDialog({ open, onOpenChange, courseId, onSuccess }: AddAssignmentDialogProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [maxScore, setMaxScore] = useState("100")
  const [rubricCriteria, setRubricCriteria] = useState<RubricCriterion[]>([
    { criterion_name: "", weight: "", description: "", indicators: "" }
  ])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const addRubricCriterion = () => {
    setRubricCriteria([...rubricCriteria, { criterion_name: "", weight: "", description: "", indicators: "" }])
  }

  const removeRubricCriterion = (index: number) => {
    if (rubricCriteria.length > 1) {
      setRubricCriteria(rubricCriteria.filter((_, i) => i !== index))
    }
  }

  const updateRubricCriterion = (index: number, field: keyof RubricCriterion, value: string) => {
    const updated = [...rubricCriteria]
    updated[index] = { ...updated[index], [field]: value }
    setRubricCriteria(updated)
  }

  const validateRubricWeights = (): boolean => {
    const totalWeight = rubricCriteria.reduce((sum, criterion) => {
      const weight = parseFloat(criterion.weight) || 0
      return sum + weight
    }, 0)
    return Math.abs(totalWeight - 100) < 0.01 // Allow small floating point differences
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validate rubric weights if criteria are provided
    const hasRubricData = rubricCriteria.some(c => c.criterion_name.trim() !== "")
    if (hasRubricData) {
      if (!validateRubricWeights()) {
        setError("Rubric weights must total exactly 100%")
        return
      }
    }

    setIsSubmitting(true)

    try {
      // Create assignment first
      const assignmentResponse = await fetch('/api/assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId,
          title: title || `Assignment ${new Date().getTime()}`,
          description,
          dueDate,
          maxScore
        }),
      })

      const assignmentData = await assignmentResponse.json()

      if (!assignmentData.success || !assignmentData.assignments || assignmentData.assignments.length === 0) {
        setError(assignmentData.error || "Failed to create assignment")
        setIsSubmitting(false)
        return
      }

      const assignmentId = assignmentData.assignments[0].assignment_id

      // Create rubrics if provided
      if (hasRubricData) {
        const validCriteria = rubricCriteria.filter(c => c.criterion_name.trim() !== "")
        
        if (validCriteria.length > 0) {
          const rubricResponse = await fetch('/api/rubrics', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              assignmentId,
              criteria: validCriteria.map(c => ({
                criterion_name: c.criterion_name,
                weight: parseFloat(c.weight) || 0,
                description: c.description,
                indicators: c.indicators.split(',').map(i => i.trim()).filter(i => i !== "")
              }))
            }),
          })

          const rubricData = await rubricResponse.json()
          if (!rubricData.success) {
            console.error('Failed to create rubrics:', rubricData.error)
            // Don't fail the whole operation if rubric creation fails
          }
        }
      }

      // Reset form
      setTitle("")
      setDescription("")
      setDueDate("")
      setMaxScore("100")
      setRubricCriteria([{ criterion_name: "", weight: "", description: "", indicators: "" }])
      onOpenChange(false)
      onSuccess()
    } catch (err) {
      setError("Failed to create assignment. Please try again.")
      console.error('Error creating assignment:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-4xl !max-h-[90vh] !overflow-y-auto !bg-white dark:!bg-gray-900">
        <DialogHeader>
          <DialogTitle className="!text-2xl !font-black">Create New Assignment</DialogTitle>
          <DialogDescription>Add a new assignment with rubric for this course</DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Assignment Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Assignment Details</h3>
            
            <div>
              <Label htmlFor="title">Assignment Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Assignment 1: Machine Learning Fundamentals"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Assignment Description/Question *</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter the assignment question or description..."
                rows={6}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dueDate">Due Date *</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="maxScore">Maximum Score</Label>
                <Input
                  id="maxScore"
                  type="number"
                  value={maxScore}
                  onChange={(e) => setMaxScore(e.target.value)}
                  min="1"
                  max="100"
                />
              </div>
            </div>
          </div>

          {/* Rubric Section */}
          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-purple-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Grading Rubric</h3>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addRubricCriterion}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Criterion
              </Button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Add grading criteria. Total weight must equal 100%.
            </p>

            <div className="space-y-4">
              {rubricCriteria.map((criterion, index) => (
                <div
                  key={index}
                  className="p-4 border-2 border-purple-200 dark:border-purple-800 rounded-lg bg-purple-50 dark:bg-purple-950/20 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <h4 className="font-semibold text-sm text-gray-900 dark:text-white">
                      Criterion {index + 1}
                    </h4>
                    {rubricCriteria.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeRubricCriterion(index)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor={`criterion-name-${index}`}>Criterion Name *</Label>
                      <Input
                        id={`criterion-name-${index}`}
                        value={criterion.criterion_name}
                        onChange={(e) => updateRubricCriterion(index, 'criterion_name', e.target.value)}
                        placeholder="e.g., Understanding of Concepts"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`criterion-weight-${index}`}>Weight (%) *</Label>
                      <Input
                        id={`criterion-weight-${index}`}
                        type="number"
                        value={criterion.weight}
                        onChange={(e) => updateRubricCriterion(index, 'weight', e.target.value)}
                        placeholder="e.g., 25"
                        min="0"
                        max="100"
                        step="0.1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor={`criterion-description-${index}`}>Description *</Label>
                    <Textarea
                      id={`criterion-description-${index}`}
                      value={criterion.description}
                      onChange={(e) => updateRubricCriterion(index, 'description', e.target.value)}
                      placeholder="Describe what this criterion evaluates..."
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label htmlFor={`criterion-indicators-${index}`}>
                      Indicators (comma-separated)
                    </Label>
                    <Input
                      id={`criterion-indicators-${index}`}
                      value={criterion.indicators}
                      onChange={(e) => updateRubricCriterion(index, 'indicators', e.target.value)}
                      placeholder="e.g., Clear explanation, Proper examples, Critical analysis"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Separate multiple indicators with commas
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {rubricCriteria.length > 0 && (
              <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Total Weight: {rubricCriteria.reduce((sum, c) => sum + (parseFloat(c.weight) || 0), 0).toFixed(1)}%
              </div>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Create Assignment
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
