"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bell, CheckCheck, AlertCircle, Info, Calendar } from "lucide-react"

type Notification = {
  id: string
  type: "info" | "warning" | "success" | "event"
  title: string
  message: string
  timestamp: Date
  read: boolean
}

const initialNotifications: Notification[] = [
  {
    id: "1",
    type: "warning",
    title: "Assignment Deadline Approaching",
    message: "CS 101 Assignment 3 is due in 2 days. 15 students haven't submitted yet.",
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    read: false,
  },
  {
    id: "2",
    type: "event",
    title: "Faculty Meeting Scheduled",
    message: "Department meeting scheduled for tomorrow at 3:00 PM in Conference Room A.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    read: false,
  },
  {
    id: "3",
    type: "info",
    title: "New Student Enrollment",
    message: "3 new students have enrolled in CS 201. Updated roster is available.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
    read: false,
  },
  {
    id: "4",
    type: "success",
    title: "Grade Submission Complete",
    message: "All grades for CS 101 Midterm have been successfully submitted.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    read: true,
  },
  {
    id: "5",
    type: "info",
    title: "Course Material Updated",
    message: "Lecture slides for Week 8 have been uploaded to the course portal.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    read: true,
  },
]

const notificationIcons = {
  info: Info,
  warning: AlertCircle,
  success: CheckCheck,
  event: Calendar,
}

const notificationColors = {
  info: "bg-primary/10 text-primary border-primary/30 border-l-primary",
  warning: "bg-destructive/10 text-destructive border-destructive/30 border-l-destructive",
  success: "bg-accent/10 text-accent border-accent/30 border-l-accent",
  event: "bg-secondary/10 text-secondary border-secondary/30 border-l-secondary",
}

export function NotificationsPanel({ onMarkAllRead }: { onMarkAllRead: () => void }) {
  const [notifications, setNotifications] = useState(initialNotifications)

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })))
    onMarkAllRead()
  }

  const handleMarkRead = (id: string) => {
    setNotifications((prev) => prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif)))
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  const formatTimestamp = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return "Just now"
  }

  return (
    <Card className="shadow-lg border-2">
      <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription className="font-medium">
              {unreadCount > 0
                ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
                : "All caught up!"}
            </CardDescription>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllRead}
              className="border-2 font-semibold hover:bg-primary hover:text-primary-foreground bg-transparent"
            >
              Mark all read
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <ScrollArea className="h-[calc(100vh-16rem)]">
          <div className="space-y-3">
            {notifications.map((notification) => {
              const Icon = notificationIcons[notification.type]
              return (
                <Card
                  key={notification.id}
                  className={`border-l-4 transition-all shadow-md hover:shadow-lg ${
                    notificationColors[notification.type]
                  } ${notification.read ? "opacity-60" : ""}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-bold text-sm text-foreground">{notification.title}</p>
                          {!notification.read && (
                            <Badge variant="default" className="shrink-0 h-2 w-2 p-0 rounded-full shadow-lg" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">{notification.message}</p>
                        <div className="flex items-center justify-between pt-1">
                          <p className="text-xs text-muted-foreground font-medium">
                            {formatTimestamp(notification.timestamp)}
                          </p>
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-auto py-1 px-2 text-xs font-semibold hover:bg-primary/10"
                              onClick={() => handleMarkRead(notification.id)}
                            >
                              Mark read
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
