"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Clock, MapPin, Users } from "lucide-react"

type ClassSession = {
  id: string
  course: string
  courseCode: string
  time: string
  duration: string
  room: string
  type: "lecture" | "lab" | "tutorial"
  students: number
}

const schedule: Record<string, ClassSession[]> = {
  Monday: [
    {
      id: "1",
      course: "Introduction to Computer Science",
      courseCode: "CS 101",
      time: "09:00 AM",
      duration: "1h 30m",
      room: "Room 301",
      type: "lecture",
      students: 45,
    },
    {
      id: "2",
      course: "Data Structures & Algorithms",
      courseCode: "CS 201",
      time: "02:00 PM",
      duration: "2h",
      room: "Lab 204",
      type: "lab",
      students: 30,
    },
  ],
  Tuesday: [
    {
      id: "3",
      course: "Introduction to Computer Science",
      courseCode: "CS 101",
      time: "10:00 AM",
      duration: "1h",
      room: "Room 305",
      type: "tutorial",
      students: 25,
    },
  ],
  Wednesday: [
    {
      id: "4",
      course: "Data Structures & Algorithms",
      courseCode: "CS 201",
      time: "09:00 AM",
      duration: "1h 30m",
      room: "Room 301",
      type: "lecture",
      students: 50,
    },
    {
      id: "5",
      course: "Introduction to Computer Science",
      courseCode: "CS 101",
      time: "02:00 PM",
      duration: "1h 30m",
      room: "Room 301",
      type: "lecture",
      students: 45,
    },
  ],
  Thursday: [
    {
      id: "6",
      course: "Data Structures & Algorithms",
      courseCode: "CS 201",
      time: "11:00 AM",
      duration: "1h",
      room: "Room 305",
      type: "tutorial",
      students: 28,
    },
  ],
  Friday: [
    {
      id: "7",
      course: "Introduction to Computer Science",
      courseCode: "CS 101",
      time: "09:00 AM",
      duration: "2h",
      room: "Lab 204",
      type: "lab",
      students: 30,
    },
  ],
}

const typeColors = {
  lecture: "bg-primary/10 text-primary border-primary/30 border-l-primary",
  lab: "bg-accent/10 text-accent border-accent/30 border-l-accent",
  tutorial: "bg-secondary/10 text-secondary border-secondary/30 border-l-secondary",
}

export function WeeklyTimetable() {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]

  return (
    <Card className="shadow-lg border-2">
      <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-accent/5">
        <CardTitle className="text-primary">Weekly Class Schedule</CardTitle>
        <CardDescription>Your teaching schedule for Spring 2025</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <ScrollArea className="h-[calc(100vh-16rem)]">
          <div className="space-y-6">
            {days.map((day) => (
              <div key={day} className="space-y-3">
                <h3 className="font-bold text-lg text-foreground sticky top-0 bg-background py-2 border-b-2 border-primary/20">
                  {day}
                </h3>
                {schedule[day] && schedule[day].length > 0 ? (
                  <div className="space-y-3">
                    {schedule[day].map((session) => (
                      <Card
                        key={session.id}
                        className={`border-l-4 shadow-md hover:shadow-lg transition-shadow ${typeColors[session.type]}`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 space-y-2">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <p className="font-bold text-foreground">{session.courseCode}</p>
                                  <p className="text-sm text-muted-foreground font-medium">{session.course}</p>
                                </div>
                                <Badge variant="outline" className="capitalize font-semibold border-2">
                                  {session.type}
                                </Badge>
                              </div>
                              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1 font-medium">
                                  <Clock className="h-4 w-4" />
                                  <span>
                                    {session.time} ({session.duration})
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 font-medium">
                                  <MapPin className="h-4 w-4" />
                                  <span>{session.room}</span>
                                </div>
                                <div className="flex items-center gap-1 font-medium">
                                  <Users className="h-4 w-4" />
                                  <span>{session.students} students</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="border-dashed border-2">
                    <CardContent className="p-6 text-center text-muted-foreground font-medium">
                      No classes scheduled
                    </CardContent>
                  </Card>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
