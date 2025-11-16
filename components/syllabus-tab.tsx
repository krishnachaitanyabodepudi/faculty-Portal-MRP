"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Calendar, Target, FileText, AlertCircle, Download } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

interface Course {
  id: string
  name: string
  code: string
  syllabusContent?: string
  students?: number
}

interface SyllabusTabProps {
  course: Course
}

export function SyllabusTab({ course }: SyllabusTabProps) {
  const [syllabusData, setSyllabusData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSyllabus()
  }, [course.id])

  const fetchSyllabus = async () => {
    try {
      setError(null)
      const response = await fetch(`/api/courses/${course.id}`)
      const data = await response.json()
      
      console.log('Fetched course data:', data)
      
      const content = data.course?.syllabusContent || ""
      
      if (!content) {
        setError('No syllabus content available')
        setSyllabusData(null)
        return
      }
      
      // Parse the text-based syllabus into structured data
      const parsed = parseSyllabusContent(content)
      setSyllabusData(parsed)
      
      console.log('Parsed syllabus data:', parsed)
    } catch (error) {
      console.error('Failed to fetch syllabus:', error)
      setError('Failed to load syllabus')
    } finally {
      setIsLoading(false)
    }
  }

  const parseSyllabusContent = (content: string) => {
    const lines = content.split('\n').filter(line => line.trim())
    
    return {
      description: extractDescription(content),
      objectives: extractObjectives(content),
      topics: parseWeeklyTopics(content),
      grading: parseGrading(content),
      fullContent: content,
      formattedSections: formatSyllabusContent(content)
    }
  }

  const formatSyllabusContent = (content: string) => {
    if (!content) return []
    
    const sections: { title: string; content: string; type: 'heading' | 'paragraph' | 'list' }[] = []
    const lines = content.split('\n')
    let currentSection: { title: string; content: string; type: 'heading' | 'paragraph' | 'list' } | null = null
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue
      
      // Detect headings (all caps, ends with colon, or numbered sections)
      const isHeading = (
        (line.length < 100 && line.endsWith(':')) ||
        /^[A-Z\s]{10,}$/.test(line) ||
        /^(Chapter|Section|Unit|Part|Module|Week)\s+\d+/i.test(line) ||
        /^\d+\.\s+[A-Z]/.test(line) ||
        /^[A-Z][A-Z\s&]{5,}:?$/.test(line)
      )
      
      // Detect list items
      const isListItem = /^[-•*]\s+|^\d+[.)]\s+|^[a-z][.)]\s+/.test(line)
      
      if (isHeading) {
        // Save previous section
        if (currentSection) {
          sections.push(currentSection)
        }
        // Start new heading section
        currentSection = {
          title: line.replace(/[:.]$/, ''),
          content: '',
          type: 'heading'
        }
      } else if (isListItem) {
        // If we're in a list, continue it
        if (currentSection && currentSection.type === 'list') {
          currentSection.content += line + '\n'
        } else {
          // Save previous section
          if (currentSection) {
            sections.push(currentSection)
          }
          // Start new list section
          currentSection = {
            title: '',
            content: line + '\n',
            type: 'list'
          }
        }
      } else {
        // Regular paragraph
        if (currentSection && currentSection.type === 'paragraph') {
          currentSection.content += (currentSection.content ? ' ' : '') + line
        } else {
          // Save previous section
          if (currentSection) {
            sections.push(currentSection)
          }
          // Start new paragraph section
          currentSection = {
            title: '',
            content: line,
            type: 'paragraph'
          }
        }
      }
    }
    
    // Add last section
    if (currentSection) {
      sections.push(currentSection)
    }
    
    // If no sections found, create a default formatted view
    if (sections.length === 0) {
      const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim())
      paragraphs.forEach((para, idx) => {
        sections.push({
          title: '',
          content: para.trim(),
          type: 'paragraph'
        })
      })
    }
    
    return sections
  }

  const extractDescription = (content: string) => {
    // Look for description section
    const descMatch = content.match(/(?:description|overview|about):\s*([^\n]+(?:\n(?!\n)[^\n]+)*)/i)
    if (descMatch) return descMatch[1].trim()
    
    // Otherwise use first few sentences
    const sentences = content.match(/[^.!?]+[.!?]+/g)
    if (sentences && sentences.length > 0) {
      return sentences.slice(0, 2).join(' ').trim()
    }
    
    return 'Course syllabus content'
  }

  const extractObjectives = (content: string) => {
    // Look for numbered objectives
    const objectiveMatches = content.match(/(?:objectives?|goals?|outcomes?):\s*([^]*?)(?=\n\n|grading|schedule|topics?|week|$)/i)
    if (objectiveMatches) {
      const objectivesText = objectiveMatches[1]
      const numbered = objectivesText.match(/\d+\.\s*([^\n]+)/g)
      if (numbered) return numbered.map(obj => obj.trim())
      
      // Try bullet points
      const bullets = objectivesText.match(/[•\-*]\s*([^\n]+)/g)
      if (bullets) return bullets.map(obj => obj.replace(/^[•\-*]\s*/, '').trim())
    }
    
    // Fallback: find any numbered list
    const fallback = content.match(/^\d+\.\s*([^\n]+)/gm)
    return fallback ? fallback.slice(0, 5) : []
  }

  const parseWeeklyTopics = (content: string) => {
    const weekMatches = content.matchAll(/(?:week|module|lecture)\s+(\d+)[\s:]*([^\n]+)(?:\n([^\n]+))?/gi)
    const topics = []
    
    for (const match of weekMatches) {
      const subtopics = match[3] 
        ? match[3].split(/[,;]/).map(s => s.trim()).filter(s => s)
        : []
      
      topics.push({
        week: parseInt(match[1]),
        title: match[2].trim(),
        subtopics
      })
    }
    
    // If no weeks found, try to extract sections
    if (topics.length === 0) {
      const sections = content.match(/(?:unit|chapter|section)\s+(\d+)[\s:]*([^\n]+)/gi)
      if (sections) {
        sections.forEach((section, index) => {
          topics.push({
            week: index + 1,
            title: section.trim(),
            subtopics: []
          })
        })
      }
    }
    
    return topics
  }

  const parseGrading = (content: string) => {
    const gradingMatches = content.matchAll(/([^:\n]+?)[\s:]+(\d+)%/gi)
    const grading = []
    
    for (const match of gradingMatches) {
      const component = match[1].trim()
      // Filter out things that don't look like grading components
      if (component.length < 50 && !component.toLowerCase().includes('week')) {
        grading.push({
          component,
          percentage: parseInt(match[2])
        })
      }
    }
    
    return grading
  }

  const handleDownloadPDF = () => {
    const pdfUrl = `/api/syllabus/pdf?course_id=${course.id}`
    window.open(pdfUrl, '_blank')
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-muted-foreground">Loading syllabus...</p>
      </div>
    )
  }

  if (error || !syllabusData) {
    return (
      <Card className="border-2">
        <CardContent className="py-12">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error || 'No syllabus uploaded yet. Add a syllabus when creating or editing the course.'}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Download Button and Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black text-gray-900 dark:text-white">Course Syllabus</h2>
        <Button
          onClick={handleDownloadPDF}
          className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold"
        >
          <Download className="w-4 h-4" />
          Download PDF
        </Button>
      </div>

      {syllabusData.fullContent && (
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-500" />
              Full Syllabus Content
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Display extracted syllabus text with proper formatting */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-inner border border-gray-200 dark:border-gray-700 max-h-[600px] overflow-y-auto">
              <div className="prose prose-lg dark:prose-invert max-w-none">
                {syllabusData.formattedSections && syllabusData.formattedSections.length > 0 ? (
                  <div className="space-y-6">
                    {syllabusData.formattedSections.map((section: any, index: number) => (
                      <div key={index} className="syllabus-section">
                        {section.type === 'heading' && section.title && (
                          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 pb-2 border-b-2 border-blue-500">
                            {section.title}
                          </h3>
                        )}
                        {section.type === 'paragraph' && (
                          <p className="text-base text-gray-700 dark:text-gray-300 leading-7 mb-4">
                            {section.content}
                          </p>
                        )}
                        {section.type === 'list' && (
                          <ul className="list-disc list-inside space-y-2 mb-4 text-gray-700 dark:text-gray-300">
                            {section.content.split('\n').filter((item: string) => item.trim()).map((item: string, idx: number) => (
                              <li key={idx} className="text-base leading-6">
                                {item.replace(/^[-•*]\s+|^\d+[.)]\s+|^[a-z][.)]\s+/, '')}
                              </li>
                            ))}
                          </ul>
                        )}
                        {section.type === 'heading' && section.content && (
                          <div className="mt-2 text-base text-gray-700 dark:text-gray-300 leading-7">
                            {section.content.split('\n').map((line: string, idx: number) => (
                              <p key={idx} className="mb-2">{line}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  // Fallback: Display raw content with white-space: pre-wrap for proper formatting
                  <div 
                    className="text-base text-gray-700 dark:text-gray-300 leading-7"
                    style={{ whiteSpace: 'pre-wrap' }}
                  >
                    {syllabusData.fullContent}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-500" />
            Course Description
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed">{syllabusData.description}</p>
        </CardContent>
      </Card>

      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-green-500" />
            Learning Objectives
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {syllabusData.objectives.map((objective, index) => (
              <li key={index} className="flex items-start gap-2">
                <Badge className="mt-0.5 bg-green-500">{index + 1}</Badge>
                <span className="text-muted-foreground">{objective}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-orange-500" />
            Weekly Topics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {syllabusData.topics.map((topic, index) => (
              <div key={`topic-${index}-${topic.week}`} className="border-l-4 border-blue-500 pl-4 py-2">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline">Week {topic.week}</Badge>
                  <h4 className="font-semibold">{topic.title}</h4>
                </div>
                <ul className="space-y-1">
                  {topic.subtopics.map((subtopic, subIndex) => (
                    <li key={`subtopic-${index}-${subIndex}`} className="text-sm text-muted-foreground ml-4">
                      • {subtopic}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-500" />
            Grading Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {syllabusData.grading.map((item, index) => (
              <div key={`grading-${index}-${item.component}`} className="flex items-center justify-between">
                <span className="font-medium">{item.component}</span>
                <div className="flex items-center gap-3">
                  <div className="w-48 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <Badge className="bg-gradient-to-r from-blue-500 to-purple-500">{item.percentage}%</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
