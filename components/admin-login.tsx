"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, Shield } from 'lucide-react'

interface Admin {
  id: string
  email: string
  name: string
  role: string
}

interface AdminLoginProps {
  onLogin: (admin: Admin) => void
}

export function AdminLogin({ onLogin }: AdminLoginProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (data.success && data.user) {
        console.log('Admin login successful:', data.user)
        localStorage.setItem('user', JSON.stringify(data.user))
        localStorage.setItem('userRole', 'admin')
        onLogin(data.user)
      } else {
        setError(data.error || "Invalid admin credentials")
      }
    } catch (err) {
      setError("Failed to connect to server. Please try again.")
      console.error('Admin login error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950 p-4 relative overflow-hidden">
      {/* Decorative background shapes */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      
      <div className="w-full max-w-md relative z-10 animate-slide-up">
        {/* Custom header design */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-600 to-orange-600 rounded-3xl mb-4 shadow-2xl shadow-red-500/30 transform hover:scale-105 transition-transform">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
            Admin Portal
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 font-medium">Secure Access Required</p>
        </div>

        {/* Custom card with strong shadow */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-8 border border-gray-100 dark:border-gray-800">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-base font-semibold text-gray-900 dark:text-white">
                Admin Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-14 text-base rounded-2xl border-2 focus:border-red-500 transition-colors"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-base font-semibold text-gray-900 dark:text-white">
                Admin Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-14 text-base rounded-2xl border-2 focus:border-red-500 transition-colors"
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
              className="w-full h-14 text-base font-bold rounded-2xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] disabled:opacity-50"
            >
              {isLoading ? "Signing in..." : "Sign In to Admin Portal"}
            </Button>

            <div className="mt-6 p-5 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 rounded-2xl border-2 border-red-100 dark:border-red-900">
              <p className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                Admin Credentials
              </p>
              <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300 font-mono">
                <div className="bg-white dark:bg-gray-900 p-2 rounded-lg">admin@university.edu</div>
                <div className="bg-white dark:bg-gray-900 p-2 rounded-lg">admin123</div>
              </div>
            </div>

            <div className="text-center">
              <Button
                type="button"
                variant="ghost"
                onClick={() => window.location.href = '/'}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                ← Back to Faculty Login
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}






