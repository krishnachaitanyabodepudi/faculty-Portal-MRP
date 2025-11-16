"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChatInterface } from "@/components/chat-interface"
import { SyllabusViewer } from "@/components/syllabus-viewer"
import { WeeklyTimetable } from "@/components/weekly-timetable"
import { NotificationsPanel } from "@/components/notifications-panel"
import { FeedbackAnalyzer } from "@/components/feedback-analyzer"
import { Bell, BookOpen, Calendar, MessageSquare, GraduationCap, Sparkles, BarChart3 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function FacultyPortal() {
  const [unreadNotifications, setUnreadNotifications] = useState(3)

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-gradient-to-r from-primary via-accent to-secondary relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black)]" />
        <div className="container mx-auto px-4 py-6 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/95 shadow-lg backdrop-blur-sm">
                <GraduationCap className="h-8 w-8 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-white text-balance">Faculty Portal</h1>
                  <Sparkles className="h-5 w-5 text-secondary animate-pulse" />
                </div>
                <p className="text-sm text-white/90 font-medium">Academic Management System</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge
                variant="secondary"
                className="text-sm font-semibold px-4 py-1.5 bg-white/95 text-primary shadow-md"
              >
                Spring 2025
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="chatbot" className="w-full">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid h-auto p-1.5 bg-card border border-border shadow-sm">
            <TabsTrigger
              value="chatbot"
              className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-3"
            >
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline font-medium">Chatbot</span>
            </TabsTrigger>
            <TabsTrigger
              value="syllabus"
              className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-3"
            >
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline font-medium">Syllabus</span>
            </TabsTrigger>
            <TabsTrigger
              value="timetable"
              className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-3"
            >
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline font-medium">Timetable</span>
            </TabsTrigger>
            <TabsTrigger
              value="feedback"
              className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-3"
            >
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline font-medium">Feedback</span>
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="gap-2 relative data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-3"
            >
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline font-medium">Notifications</span>
              {unreadNotifications > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center shadow-lg"
                >
                  {unreadNotifications}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <div className="mt-8">
            <TabsContent value="chatbot" className="m-0">
              <ChatInterface />
            </TabsContent>

            <TabsContent value="syllabus" className="m-0">
              <SyllabusViewer />
            </TabsContent>

            <TabsContent value="timetable" className="m-0">
              <WeeklyTimetable />
            </TabsContent>

            <TabsContent value="feedback" className="m-0">
              <FeedbackAnalyzer />
            </TabsContent>

            <TabsContent value="notifications" className="m-0">
              <NotificationsPanel onMarkAllRead={() => setUnreadNotifications(0)} />
            </TabsContent>
          </div>
        </Tabs>
      </main>
    </div>
  )
}
