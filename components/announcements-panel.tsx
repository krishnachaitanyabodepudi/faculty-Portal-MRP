"use client"

import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Mail, Send } from "lucide-react"

interface Announcement {
  id: string
  title: string
  message: string
  courseId?: string | null
  createdAt: string
  senderRole: "faculty" | "student"
  senderName?: string | null
  target: "students" | "faculty" | "all"
  toEmail?: string | null
}

interface CourseOption {
  id: string
  code: string
  name: string
}

interface AnnouncementsPanelProps {
  facultyId?: string
  facultyName?: string
  courseIdFilter?: string
  hideCourseSelector?: boolean
}

export function AnnouncementsPanel({
  facultyId,
  facultyName,
  courseIdFilter,
  hideCourseSelector,
}: AnnouncementsPanelProps) {
  const isCourseMode = !!courseIdFilter

  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [courseId, setCourseId] = useState<string>(courseIdFilter || "all")
  const [isSending, setIsSending] = useState(false)
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [courses, setCourses] = useState<CourseOption[]>([])
  const [error, setError] = useState<string | null>(null)
  const [toEmail, setToEmail] = useState("")
  const [attachmentName, setAttachmentName] = useState<string | null>(null)

  useEffect(() => {
    loadAnnouncements()
    if (!courseIdFilter && !hideCourseSelector) {
      loadCourses()
    }
  }, [courseIdFilter, hideCourseSelector])

  const loadAnnouncements = async () => {
    try {
      const url = courseIdFilter
        ? `/api/announcements?course_id=${courseIdFilter}`
        : "/api/announcements"
      const res = await fetch(url)
      const data = await res.json()
      if (data.announcements) {
        setAnnouncements(data.announcements)
      }
    } catch (err) {
      console.error("Failed to load announcements:", err)
    }
  }

  const loadCourses = async () => {
    try {
      const res = await fetch("/api/courses")
      const data = await res.json()
      if (data.courses) {
        const options = data.courses.map((c: any) => ({
          id: c.id,
          code: c.code,
          name: c.name,
        }))
        setCourses(options)
      }
    } catch (err) {
      console.error("Failed to load courses for announcements:", err)
    }
  }

  const handleSend = async () => {
    if (isCourseMode) {
      if (!title.trim() || !message.trim()) {
        setError("Please enter both a subject and message.")
        return
      }
    } else {
      if (!toEmail.trim() || !title.trim() || !message.trim()) {
        setError("Please enter recipient email, subject, and message.")
        return
      }
    }

    setIsSending(true)
    setError(null)
    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          message: message.trim(),
          courseId: isCourseMode ? (courseIdFilter ? courseIdFilter : courseId === "all" ? null : courseId) : null,
          senderRole: "faculty",
          senderId: facultyId || undefined,
          senderName: facultyName || undefined,
          target: isCourseMode ? "students" : "all",
          toEmail: isCourseMode ? undefined : toEmail.trim(),
        }),
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to send announcement")
      }

      if (!isCourseMode) {
        setToEmail("")
        setAttachmentName(null)
      }
      setTitle("")
      setMessage("")
      setCourseId(courseIdFilter || "all")
      await loadAnnouncements()
    } catch (err: any) {
      console.error("Failed to send announcement:", err)
      setError(err?.message || "Failed to send announcement. Please try again.")
    } finally {
      setIsSending(false)
    }
  }

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleString()
  }

  return (
    <Card className="shadow-lg border-2">
      <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Mail className="h-5 w-5" />
              {isCourseMode ? "Course Announcements" : "Mailbox"}
            </CardTitle>
            <CardDescription className="font-medium">
              {isCourseMode
                ? "Post announcements for this course. Enrolled students can see them."
                : "View recent mails and compose a new message."}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <div className="space-y-3">
          {isCourseMode ? (
            <>
              <div className="grid gap-3 md:grid-cols-[1fr,180px]">
                <Input
                  placeholder="Subject"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                {!hideCourseSelector && (
                  <select
                    className="border rounded-md px-3 py-2 text-sm bg-background"
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}
                  >
                    <option value="all">All courses</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.code} – {c.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <Textarea
                placeholder="Write your announcement..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
              />
            </>
          ) : (
            <>
              <Input
                placeholder="Recipient email"
                value={toEmail}
                onChange={(e) => setToEmail(e.target.value)}
              />
              <Input
                placeholder="Subject"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <Textarea
                placeholder="Write your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
              />
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    id="mail-attachment"
                    className="text-xs"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      setAttachmentName(file ? file.name : null)
                    }}
                  />
                  {attachmentName && (
                    <span className="text-xs text-muted-foreground">
                      Attached: {attachmentName}
                    </span>
                  )}
                </div>
              </div>
            </>
          )}
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
          )}
          <div className="flex justify-end">
            <Button
              onClick={handleSend}
              disabled={isSending}
              className="gap-2 font-semibold"
            >
              <Send className="h-4 w-4" />
              {isSending ? "Sending..." : isCourseMode ? "Send Announcement" : "Send Mail"}
            </Button>
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="text-sm font-semibold mb-3">
            {isCourseMode ? "Recent announcements" : "Recent mails"}
          </h3>
          {announcements.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {isCourseMode
                ? "No announcements have been posted yet."
                : "No mails yet. New messages will appear here."}
            </p>
          ) : (
            <ScrollArea className="h-[calc(100vh-20rem)] pr-3">
              <div className="space-y-3">
                {announcements.map((a) => (
                  <div
                    key={a.id}
                    className="border rounded-md p-3 bg-muted/40 space-y-1"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-sm">{a.title}</p>
                      <span className="text-[11px] text-muted-foreground">
                        {formatDate(a.createdAt)}
                      </span>
                    </div>
                    {a.courseId && (
                      <p className="text-xs text-muted-foreground">
                        Course: {a.courseId}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      From {a.senderRole === "student" ? "Student" : "Faculty"}
                      {a.senderName ? ` • ${a.senderName}` : ""}
                      {a.toEmail && !isCourseMode ? ` → ${a.toEmail}` : ""}
                    </p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {a.message}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </CardContent>
    </Card>
  )
}


