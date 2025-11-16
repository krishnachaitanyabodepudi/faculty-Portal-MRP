"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, BookOpen, Sparkles } from 'lucide-react'

interface AddCourseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddCourse: (course: {
    name: string
    code: string
    duration: string
    students: number
    syllabus?: File
    timetable?: File
  }) => void
}

export function AddCourseDialog({ open, onOpenChange, onAddCourse }: AddCourseDialogProps) {
  const [name, setName] = useState("")
  const [code, setCode] = useState("")
  const [duration, setDuration] = useState("")
  const [students, setStudents] = useState("")
  const [syllabus, setSyllabus] = useState<File | undefined>()
  const [timetable, setTimetable] = useState<File | undefined>()
  const [isUploading, setIsUploading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUploading(true)
    
    try {
      await onAddCourse({
        name,
        code,
        duration,
        students: Number.parseInt(students) || 0,
        syllabus,
        timetable,
      })
      
      // Reset form
      setName("")
      setCode("")
      setDuration("")
      setStudents("")
      setSyllabus(undefined)
      setTimetable(undefined)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-3xl !bg-white dark:!bg-gray-900 !border-2 !border-gray-200 dark:!border-gray-800 !rounded-3xl !shadow-2xl !p-0 !overflow-hidden">
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6 text-white">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <DialogTitle className="!text-3xl !font-black !text-white !m-0">
                Add New Course
              </DialogTitle>
            </div>
            <DialogDescription className="!text-blue-100 !text-base !font-medium !mt-2">
              Fill in the course details below. All fields are required.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Form Content */}
        <div className="px-8 py-6 bg-white dark:bg-gray-900">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Course Name and Code */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="name" className="!text-base !font-bold !text-gray-900 dark:!text-white">
                  Course Name *
                </Label>
                <Input
                  id="name"
                  placeholder="e.g., Data Structures and Algorithms"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="!h-12 !text-base !font-medium !border-2 !border-gray-300 dark:!border-gray-700 focus:!border-blue-500 !rounded-xl !bg-white dark:!bg-gray-800"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="code" className="!text-base !font-bold !text-gray-900 dark:!text-white">
                  Course Code *
                </Label>
                <Input
                  id="code"
                  placeholder="e.g., CS301"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  className="!h-12 !text-base !font-medium !border-2 !border-gray-300 dark:!border-gray-700 focus:!border-blue-500 !rounded-xl !bg-white dark:!bg-gray-800"
                />
              </div>
            </div>

            {/* Duration and Students */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="duration" className="!text-base !font-bold !text-gray-900 dark:!text-white">
                  Course Duration *
                </Label>
                <Input
                  id="duration"
                  placeholder="e.g., 14 weeks"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  required
                  className="!h-12 !text-base !font-medium !border-2 !border-gray-300 dark:!border-gray-700 focus:!border-blue-500 !rounded-xl !bg-white dark:!bg-gray-800"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="students" className="!text-base !font-bold !text-gray-900 dark:!text-white">
                  Number of Students *
                </Label>
                <Input
                  id="students"
                  type="number"
                  placeholder="e.g., 45"
                  value={students}
                  onChange={(e) => setStudents(e.target.value)}
                  required
                  className="!h-12 !text-base !font-medium !border-2 !border-gray-300 dark:!border-gray-700 focus:!border-blue-500 !rounded-xl !bg-white dark:!bg-gray-800"
                />
              </div>
            </div>

            {/* File Uploads */}
            <div className="space-y-6 pt-2">
              {/* Syllabus PDF Upload - Text will be extracted and stored */}
              <div className="space-y-3">
                <Label htmlFor="syllabus" className="!text-base !font-bold !text-gray-900 dark:!text-white">
                  Upload Syllabus PDF *
                </Label>
                <p className="text-sm text-muted-foreground">
                  Upload a PDF syllabus. The text content will be extracted and stored automatically.
                </p>
                <div className="relative">
                  <Input
                    id="syllabus"
                    type="file"
                    accept=".pdf,.txt"
                    onChange={(e) => setSyllabus(e.target.files?.[0])}
                    className="!h-12 !text-base !font-medium !border-2 !border-gray-300 dark:!border-gray-700 focus:!border-blue-500 !rounded-xl !bg-white dark:!bg-gray-800 !cursor-pointer !pr-10"
                    disabled={isUploading}
                    required
                  />
                  <Upload className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
                {syllabus && (
                  <div className="mt-2 p-3 bg-green-50 dark:bg-green-950/30 border-2 border-green-200 dark:border-green-800 rounded-xl">
                    <p className="text-sm font-semibold text-green-700 dark:text-green-300">
                      ✓ Selected: <span className="font-bold">{syllabus.name}</span> ({(syllabus.size / 1024).toFixed(1)} KB)
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <Label htmlFor="timetable" className="!text-base !font-bold !text-gray-900 dark:!text-white">
                  Upload Timetable (PDF, DOCX, XLSX, or TXT)
                </Label>
                <div className="relative">
                  <Input
                    id="timetable"
                    type="file"
                    accept=".pdf,.docx,.xlsx,.txt"
                    onChange={(e) => setTimetable(e.target.files?.[0])}
                    className="!h-12 !text-base !font-medium !border-2 !border-gray-300 dark:!border-gray-700 focus:!border-blue-500 !rounded-xl !bg-white dark:!bg-gray-800 !cursor-pointer !pr-10"
                    disabled={isUploading}
                  />
                  <Upload className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
                {timetable && (
                  <div className="mt-2 p-3 bg-green-50 dark:bg-green-950/30 border-2 border-green-200 dark:border-green-800 rounded-xl">
                    <p className="text-sm font-semibold text-green-700 dark:text-green-300">
                      ✓ Selected: <span className="font-bold">{timetable.name}</span> ({(timetable.size / 1024).toFixed(1)} KB)
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-6 border-t-2 border-gray-200 dark:border-gray-800">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)} 
                disabled={isUploading}
                className="!h-12 !px-8 !text-base !font-bold !rounded-xl !border-2"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isUploading}
                className="!h-12 !px-8 !text-base !font-bold !rounded-xl !bg-gradient-to-r !from-blue-600 !to-purple-600 hover:!from-blue-700 hover:!to-purple-700 !text-white !shadow-lg hover:!shadow-xl !transition-all"
              >
                {isUploading ? (
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 animate-pulse" />
                    Uploading...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Add Course
                  </span>
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
