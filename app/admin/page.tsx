"use client"

import { useState } from "react"
import { AdminPortal } from "@/components/admin-portal"
import { AdminLogin } from "@/components/admin-login"

interface Admin {
  id: string
  email: string
  name: string
  role: string
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [admin, setAdmin] = useState<Admin | null>(null)

  const handleLogin = (loggedInAdmin: Admin) => {
    setAdmin(loggedInAdmin)
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    setAdmin(null)
    setIsAuthenticated(false)
    window.location.href = '/'
  }

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />
  }

  return <AdminPortal onLogout={handleLogout} />
}

