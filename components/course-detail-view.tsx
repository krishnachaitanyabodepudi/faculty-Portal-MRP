"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, BookOpen, MessageSquare, BarChart3, LogOut, Sparkles, FileText, Mail } from 'lucide-react'
import { SyllabusTab } from "@/components/syllabus-tab"
import { ChatbotTab } from "@/components/chatbot-tab"
import { FeedbackAnalyzerTab } from "@/components/feedback-analyzer-tab"
import { AssignmentsTab } from "@/components/assignments-tab"
import { AnnouncementsPanel } from "@/components/announcements-panel"

interface Course {
  id: string
  name: string
  code: string
  duration: string
  students: number
}

interface CourseDetailViewProps {
  course: Course
  onBack: () => void
  onLogout: () => void
  facultyId?: string
  facultyName?: string
}

export function CourseDetailView({ course, onBack, onLogout, facultyId, facultyName }: CourseDetailViewProps) {
  const [activeTab, setActiveTab] = useState<"syllabus" | "chatbot" | "feedback" | "assignments" | "announcements">("syllabus")

  const tabs = [
    { id: "syllabus" as const, label: "Syllabus", icon: BookOpen, color: "blue" },
    { id: "assignments" as const, label: "Assignments", icon: FileText, color: "orange" },
    { id: "chatbot" as const, label: "Assistant", icon: MessageSquare, color: "purple" },
    { id: "feedback" as const, label: "Feedback Analyzer", icon: BarChart3, color: "green" },
    { id: "announcements" as const, label: "Announcements", icon: Mail, color: "indigo" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950">
      {/* Custom header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b-4 border-blue-600 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={onBack}
                className="w-12 h-12 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <ArrowLeft className="w-6 h-6" />
              </Button>
              <div className="flex items-center gap-3">
                <span className="inline-block px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl text-sm shadow-md">
                  {course.code}
                </span>
                <div>
                  <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                    {course.name}
                  </h1>
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                    {course.students} students • {course.duration}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={onLogout}
                className="gap-2 h-12 px-6 rounded-2xl border-2 font-semibold hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Custom tabs - Canva style */}
      <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-2 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-8 py-5 font-bold transition-all whitespace-nowrap rounded-t-2xl ${
                    isActive
                      ? "text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-900 border-b-4 border-blue-600 shadow-lg transform scale-105"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-white/40 dark:hover:bg-gray-900/40"
                  }`}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-base">{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="animate-fade-in">
          {activeTab === "syllabus" && <SyllabusTab course={course} />}
          {activeTab === "assignments" && <AssignmentsTab course={course} />}
          {activeTab === "chatbot" && <ChatbotTab course={course} />}
          {activeTab === "feedback" && <FeedbackAnalyzerTab course={course} />}
          {activeTab === "announcements" && (
            <div className="max-w-4xl">
              <AnnouncementsPanel
                facultyId={facultyId}
                facultyName={facultyName}
                courseIdFilter={course.id}
                hideCourseSelector
              />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
