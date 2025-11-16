"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Plus, Calendar, Target, Trash2 } from "lucide-react"
import { AddAssignmentDialog } from "@/components/add-assignment-dialog"
import { AssignmentDetail } from "@/components/assignment-detail"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Course {
  id: string
  name: string
  code: string
}

interface Assignment {
  assignment_id: string
  course_id: string
  title: string
  description: string
  due_date: string
  max_score: number
}

export function AssignmentsTab({ course }: { course: Course }) {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [assignmentToDelete, setAssignmentToDelete] = useState<Assignment | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchAssignments()
  }, [course.id])

  const fetchAssignments = async () => {
    try {
      const response = await fetch(`/api/assignments?course_id=${course.id}`)
      const data = await response.json()
      
      if (data.assignments) {
        setAssignments(data.assignments)
      }
    } catch (error) {
      console.error('Failed to fetch assignments:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteClick = (e: React.MouseEvent, assignment: Assignment) => {
    e.stopPropagation() // Prevent card click
    setAssignmentToDelete(assignment)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!assignmentToDelete) return

    setIsDeleting(true)
    try {
      const response = await fetch(
        `/api/assignments?assignment_id=${assignmentToDelete.assignment_id}`,
        { method: 'DELETE' }
      )

      const data = await response.json()

      if (data.success) {
        // Remove from local state
        setAssignments(assignments.filter(a => a.assignment_id !== assignmentToDelete.assignment_id))
        setDeleteDialogOpen(false)
        setAssignmentToDelete(null)
      } else {
        console.error('Failed to delete assignment:', data.error)
        alert('Failed to delete assignment. Please try again.')
      }
    } catch (error) {
      console.error('Error deleting assignment:', error)
      alert('Failed to delete assignment. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  if (selectedAssignment) {
    return (
      <AssignmentDetail
        assignment={{
          id: selectedAssignment.assignment_id,
          name: `Assignment ${selectedAssignment.assignment_id.split('_')[1] || ''}`,
          title: selectedAssignment.title,
          submissions: 0,
          totalStudents: 0,
          description: selectedAssignment.description,
          dueDate: selectedAssignment.due_date
        }}
        course={course}
        onBack={() => setSelectedAssignment(null)}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white">Course Assignments</h2>
          <p className="text-gray-600 dark:text-gray-400">Manage and view assignments for {course.name}</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Create Assignment
        </Button>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">Loading assignments...</p>
          </CardContent>
        </Card>
      ) : assignments.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No assignments created yet.</p>
            <Button onClick={() => setShowAddDialog(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Create Your First Assignment
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {assignments.map((assignment) => (
            <Card
              key={assignment.assignment_id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedAssignment(assignment)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{assignment.title}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Due: {new Date(assignment.due_date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Target className="w-4 h-4" />
                        {assignment.max_score} points
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedAssignment(assignment)
                      }}
                    >
                      View Details
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleDeleteClick(e, assignment)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300 line-clamp-2">
                  {assignment.description.substring(0, 200)}...
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AddAssignmentDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        courseId={course.id}
        onSuccess={fetchAssignments}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-gradient-to-br from-white via-red-50 to-orange-50 dark:from-gray-900 dark:via-red-950/30 dark:to-orange-950/30 border-2 border-red-200 dark:border-red-800 shadow-2xl max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black text-gray-900 dark:text-white mb-2">
              Delete Assignment
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base font-medium text-gray-700 dark:text-gray-300 leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-gray-900 dark:text-white">"{assignmentToDelete?.title}"</span>? 
              <br />
              <span className="text-red-600 dark:text-red-400 font-semibold mt-3 block text-sm">
                ⚠️ This action cannot be undone and will also remove all related rubrics and submission data.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel 
              disabled={isDeleting}
              className="font-semibold px-6 py-2"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2 shadow-lg hover:shadow-xl transition-all"
            >
              {isDeleting ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Deleting...
                </span>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}


