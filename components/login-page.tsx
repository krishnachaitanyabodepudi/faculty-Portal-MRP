"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, Sparkles, GraduationCap, UserCog, Users } from 'lucide-react'

interface User {
  id: string
  email: string
  name: string
  department: string
  designation?: string
}

interface LoginPageProps {
  onLogin: (user: User) => void
}

type LoginType = 'faculty' | 'student' | 'admin' | null

export function LoginPage({ onLogin }: LoginPageProps) {
  const [loginType, setLoginType] = useState<LoginType>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      let endpoint = '/api/auth/login'
      if (loginType === 'admin') {
        endpoint = '/api/auth/admin'
      } else if (loginType === 'student') {
        endpoint = '/api/auth/student'
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (data.success && data.user) {
        console.log('Login successful, user:', data.user)
        
        // Redirect based on login type
        if (loginType === 'admin') {
          window.location.href = '/admin'
          return
        } else if (loginType === 'student') {
          window.location.href = '/student'
          return
        } else {
          // Faculty login
          onLogin(data.user)
        }
      } else {
        setError(data.error || "Invalid email or password")
      }
    } catch (err) {
      setError("Failed to connect to server. Please try again.")
      console.error('Login error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Show login type selection
  if (!loginType) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950 p-4 relative overflow-hidden">
        {/* Decorative background shapes */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        
        <div className="w-full max-w-2xl relative z-10 animate-slide-up">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl mb-4 shadow-2xl shadow-blue-500/30 transform hover:scale-105 transition-transform">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
              Silverleaf University
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 font-medium">Portal Login</p>
          </div>

          {/* Login type selection cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Faculty Login */}
            <button
              onClick={() => setLoginType('faculty')}
              className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl p-8 border-2 border-gray-200 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-2xl transition-all transform hover:scale-105 group"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white">Faculty Login</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Access your courses and manage assignments</p>
              </div>
            </button>

            {/* Student Login */}
            <button
              onClick={() => setLoginType('student')}
              className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl p-8 border-2 border-gray-200 dark:border-gray-800 hover:border-purple-500 dark:hover:border-purple-500 hover:shadow-2xl transition-all transform hover:scale-105 group"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <GraduationCap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white">Student Login</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">View assignments and submit your work</p>
              </div>
            </button>

            {/* Admin Login */}
            <button
              onClick={() => setLoginType('admin')}
              className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl p-8 border-2 border-gray-200 dark:border-gray-800 hover:border-red-500 dark:hover:border-red-500 hover:shadow-2xl transition-all transform hover:scale-105 group"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <UserCog className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white">Admin Login</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Manage faculty, courses, and system settings</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Show login form based on selected type
  const loginTypeLabels = {
    faculty: { title: 'Faculty Portal', icon: Users, color: 'blue' },
    student: { title: 'Student Portal', icon: GraduationCap, color: 'purple' },
    admin: { title: 'Admin Portal', icon: UserCog, color: 'red' }
  }

  const currentLabel = loginTypeLabels[loginType]
  const Icon = currentLabel.icon

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950 p-4 relative overflow-hidden">
      {/* Decorative background shapes */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      
      <div className="w-full max-w-md relative z-10 animate-slide-up">
        {/* Header */}
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-4 shadow-2xl transform hover:scale-105 transition-transform ${
            loginType === 'faculty' ? 'bg-gradient-to-br from-blue-600 to-blue-700 shadow-blue-500/30' :
            loginType === 'student' ? 'bg-gradient-to-br from-purple-600 to-purple-700 shadow-purple-500/30' :
            'bg-gradient-to-br from-red-600 to-red-700 shadow-red-500/30'
          }`}>
            <Icon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
            Silverleaf University
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 font-medium">{currentLabel.title}</p>
        </div>

        {/* Login form card */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-8 border border-gray-100 dark:border-gray-800">
          <div className="mb-6">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setLoginType(null)
                setEmail("")
                setPassword("")
                setError("")
              }}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            >
              ← Back to Login Options
            </Button>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-base font-semibold text-gray-900 dark:text-white">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email or username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-14 text-base rounded-2xl border-2 focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-base font-semibold text-gray-900 dark:text-white">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-14 text-base rounded-2xl border-2 focus:border-blue-500 transition-colors"
              />
            </div>

            {error && (
              <div className="flex items-center gap-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 p-4 rounded-2xl border-2 border-red-200 dark:border-red-800">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className={`w-full h-14 text-base font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] disabled:opacity-50 ${
                loginType === 'faculty' ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800' :
                loginType === 'student' ? 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800' :
                'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800'
              }`}
            >
              {isLoading ? "Signing in..." : `Sign In to ${currentLabel.title}`}
            </Button>

            {loginType === 'faculty' && (
              <div className="mt-6 p-5 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-2xl border-2 border-blue-100 dark:border-blue-900">
                <p className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  Demo Credentials
                </p>
                <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300 font-mono">
                  <div className="bg-white dark:bg-gray-900 p-2 rounded-lg">sarah.mitchell@university.edu</div>
                  <div className="bg-white dark:bg-gray-900 p-2 rounded-lg">faculty101</div>
                  <p className="text-xs text-gray-500 mt-2">Or use any faculty email with password: faculty101-108</p>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
