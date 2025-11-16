"use client"

import { useState } from "react"
import { StudentDashboard } from "@/components/student-dashboard"
import { StudentLogin } from "@/components/student-login"

interface Student {
  id: string
  email: string
  name: string
  enrolled_courses: string[]
  role: string
}

export default function StudentPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [student, setStudent] = useState<Student | null>(null)

  const handleLogin = (loggedInStudent: Student) => {
    setStudent(loggedInStudent)
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    setStudent(null)
    setIsAuthenticated(false)
    window.location.href = '/'
  }

  if (!isAuthenticated) {
    return <StudentLogin onLogin={handleLogin} />
  }

  return <StudentDashboard student={student!} onLogout={handleLogout} />
}






