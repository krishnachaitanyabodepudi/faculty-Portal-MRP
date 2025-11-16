"use client"

import { useState } from "react"
import { LoginPage } from "@/components/login-page"
import { CourseDashboard } from "@/components/course-dashboard"

interface User {
  id: string
  email: string
  name: string
  department: string
  designation?: string
}

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser)
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    setUser(null)
    setIsAuthenticated(false)
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />
  }

  return <CourseDashboard user={user} onLogout={handleLogout} />
}
