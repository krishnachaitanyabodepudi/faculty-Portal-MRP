"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { BookOpen, Download, FileText, Clock } from "lucide-react"

interface Course {
  id: string
  code: string
  name: string
  syllabusContent?: string
}

interface SyllabusViewerProps {
  facultyId?: string
}

export function SyllabusViewer({ facultyId }: SyllabusViewerProps) {
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchCourses()
  }, [facultyId])

  const fetchCourses = async () => {
    try {
      const url = facultyId ? `/api/courses?faculty_id=${facultyId}` : '/api/courses'
      const response = await fetch(url)
      const data = await response.json()
      setCourses(data.courses || [])
      if (data.courses && data.courses.length > 0) {
        setSelectedCourse(data.courses[0])
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const parseSyllabus = (content: string) => {
    if (!content) return []
    
    const sections: { title: string; content: string }[] = []
    const lines = content.split('\n')
    let currentSection = { title: '', content: '' }
    
    for (const line of lines) {
      if (line.trim().startsWith('===') || line.trim() === '') continue
      
      if (line.trim().endsWith(':') && line.length < 100) {
        if (currentSection.title) {
          sections.push({ ...currentSection })
        }
        currentSection = { title: line.trim().replace(':', ''), content: '' }
      } else if (currentSection.title) {
        currentSection.content += line + '\n'
      }
    }
    
    if (currentSection.title) {
      sections.push(currentSection)
    }
    
    // If no sections found, create default sections
    if (sections.length === 0) {
      sections.push({ title: 'Course Syllabus', content: content })
    }
    
    return sections
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-muted-foreground">Loading courses...</p>
        </div>
      </div>
    )
  }

  if (!selectedCourse) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No courses available</p>
      </div>
    )
  }

  const syllabusSections = parseSyllabus(selectedCourse.syllabusContent || '')

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Course List */}
      <Card className="lg:col-span-1 shadow-lg border-2">
        <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-accent/5">
          <CardTitle className="text-lg text-primary">My Courses</CardTitle>
          <CardDescription>Select a course to view syllabus</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-2">
            {courses.map((course) => (
              <button
                key={course.id}
                onClick={() => setSelectedCourse(course)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all shadow-sm hover:shadow-md ${
                  selectedCourse?.id === course.id
                    ? "bg-gradient-to-br from-primary to-accent text-primary-foreground border-primary shadow-lg scale-[1.02]"
                    : "bg-card hover:bg-muted border-border"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{course.code}</p>
                    <p className="text-xs opacity-90 line-clamp-2 mt-0.5">{course.name}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Syllabus Content */}
      <Card className="lg:col-span-2 shadow-lg border-2">
        <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-accent/5">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <BookOpen className="h-5 w-5 text-primary" />
                <CardTitle className="text-primary">{selectedCourse.code}</CardTitle>
              </div>
              <CardDescription className="text-base font-semibold text-foreground">
                {selectedCourse.name}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-2 font-semibold hover:bg-primary hover:text-primary-foreground bg-transparent"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <ScrollArea className="h-[calc(100vh-24rem)]">
            {syllabusSections.length > 0 ? (
              <Accordion type="single" collapsible className="w-full" defaultValue="item-0">
                {syllabusSections.map((section, index) => (
                  <AccordionItem key={index} value={`item-${index}`} className="border-b-2">
                    <AccordionTrigger className="text-left hover:no-underline hover:bg-muted/50 px-2 rounded-lg">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        <span className="font-semibold">{section.title}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="pl-6 pr-2 py-3 text-sm leading-relaxed text-muted-foreground bg-muted/30 rounded-lg mx-2 mb-2 whitespace-pre-wrap">
                        {section.content}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <div className="p-6 text-muted-foreground">
                <p>Syllabus content not available for this course.</p>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
