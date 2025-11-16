"use client"

import { useState, useEffect } from "react"
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
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // Check for stored authentication
    const storedUser = localStorage.getItem('user')
    const storedRole = localStorage.getItem('userRole')
    
    if (storedUser && storedRole === 'student') {
      try {
        const userData = JSON.parse(storedUser)
        if (userData.role === 'student' || userData.id?.startsWith('S')) {
          setStudent(userData)
          setIsAuthenticated(true)
        }
      } catch (error) {
        console.error('Error parsing stored user:', error)
        localStorage.removeItem('user')
        localStorage.removeItem('userRole')
      }
    }
    setIsChecking(false)
  }, [])

  const handleLogin = (loggedInStudent: Student) => {
    setStudent(loggedInStudent)
    setIsAuthenticated(true)
    localStorage.setItem('user', JSON.stringify(loggedInStudent))
    localStorage.setItem('userRole', 'student')
  }

  const handleLogout = () => {
    setStudent(null)
    setIsAuthenticated(false)
    localStorage.removeItem('user')
    localStorage.removeItem('userRole')
    window.location.href = '/'
  }

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <StudentLogin onLogin={handleLogin} />
  }

  return <StudentDashboard student={student!} onLogout={handleLogout} />
}






