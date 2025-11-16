"use client"

import { useState, useEffect } from "react"
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
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // Check for stored authentication
    const storedUser = localStorage.getItem('user')
    const storedRole = localStorage.getItem('userRole')
    
    if (storedUser && storedRole === 'admin') {
      try {
        const userData = JSON.parse(storedUser)
        if (userData.role === 'admin' || userData.id === 'admin') {
          setAdmin(userData)
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

  const handleLogin = (loggedInAdmin: Admin) => {
    setAdmin(loggedInAdmin)
    setIsAuthenticated(true)
    localStorage.setItem('user', JSON.stringify(loggedInAdmin))
    localStorage.setItem('userRole', 'admin')
  }

  const handleLogout = () => {
    setAdmin(null)
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
    return <AdminLogin onLogin={handleLogin} />
  }

  return <AdminPortal onLogout={handleLogout} />
}

