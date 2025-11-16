"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { BookOpen, Trash2, LogOut, Clock, Users, Sparkles } from 'lucide-react'
import { CourseDetailView } from "@/components/course-detail-view"

interface Course {
  id: string
  name: string
  code: string
  duration: string
  students: number
  syllabus?: File
  timetable?: File
}

interface User {
  id: string
  email: string
  name: string
  department: string
  designation?: string
}

interface CourseDashboardProps {
  user: User | null
  onLogout: () => void
}

export function CourseDashboard({ user, onLogout }: CourseDashboardProps) {
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)

  useEffect(() => {
    if (user && user.id) {
      console.log('User logged in, fetching courses for:', user.id, user.name)
      fetchCourses()
    } else {
      console.warn('User object missing or invalid:', user)
      setIsLoading(false)
    }
  }, [user])

  const fetchCourses = async () => {
    if (!user) {
      console.error('No user provided to fetchCourses')
      setIsLoading(false)
      return
    }
    
    setIsLoading(true)
    try {
      const apiUrl = `/api/courses?faculty_id=${user.id}`
      console.log('Fetching courses from:', apiUrl)
      console.log('User ID:', user.id)
      
      const response = await fetch(apiUrl)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('API error:', response.status, errorText)
        setCourses([])
        return
      }
      
      const data = await response.json()
      console.log('Courses API response:', data)
      
      if (data.courses && Array.isArray(data.courses)) {
        console.log(`Loaded ${data.courses.length} courses for faculty ${user.id}`)
        setCourses(data.courses)
      } else {
        console.warn('Invalid courses data format:', data)
        setCourses([])
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error)
      setCourses([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteCourse = async (id: string) => {
    // Confirm deletion before proceeding
    const course = courses.find(c => c.id === id)
    const courseName = course?.name || 'this course'
    
    if (!confirm(`Are you sure you want to delete "${courseName}"? This action cannot be undone.`)) {
      return
    }
    
    try {
      const response = await fetch(`/api/courses?id=${id}`, { method: 'DELETE' })
      if (response.ok) {
        // Refresh the courses list after successful deletion
        await fetchCourses()
      } else {
        const errorData = await response.json()
        console.error('Failed to delete course:', errorData.error)
        alert('Failed to delete course. Please try again.')
      }
    } catch (error) {
      console.error('Failed to delete course:', error)
      alert('Failed to delete course. Please try again.')
    }
  }

  if (selectedCourse) {
    return <CourseDetailView course={selectedCourse} onBack={() => setSelectedCourse(null)} onLogout={onLogout} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950">
      {/* Bold custom header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b-4 border-blue-600 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                  Silverleaf University
                </h1>
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                  {user?.name || 'Faculty Portal'} - {user?.department || ''}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={onLogout}
                className="gap-2 h-12 px-6 rounded-2xl border-2 font-semibold hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Custom section header */}
        <div className="flex items-center justify-between mb-10 animate-slide-up">
          <div>
            <h2 className="text-5xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">
              My Courses
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 font-medium">
              {courses.length} {courses.length === 1 ? "course" : "courses"} this semester
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-24">
            <div className="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="mt-6 text-xl font-semibold text-gray-600 dark:text-gray-400">
              Loading your courses...
            </p>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">
              Fetching courses for {user?.name || 'faculty'}...
            </p>
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-16 border-4 border-dashed border-gray-300 dark:border-gray-700 text-center animate-fade-in">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-950/30 dark:to-purple-950/30 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-3">No courses available</h3>
            <p className="text-lg text-gray-600 dark:text-gray-400 font-medium">
              Contact your administrator to add courses
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course, index) => (
              <div
                key={course.id}
                className="group cursor-pointer animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => setSelectedCourse(course)}
              >
                <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border-2 border-gray-200 dark:border-gray-800 hover:border-blue-600 dark:hover:border-blue-600 shadow-lg hover:shadow-2xl transition-all transform hover:scale-[1.02]">
                  {/* Course code badge */}
                  <div className="flex items-start justify-between mb-4">
                    <span className="inline-block px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl text-sm shadow-md">
                      {course.code}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteCourse(course.id)
                      }}
                      className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Course name */}
                  <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 leading-tight">
                    {course.name}
                  </h3>

                  {/* Course details */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-950/30 rounded-xl flex items-center justify-center">
                        <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {course.duration}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 dark:bg-purple-950/30 rounded-xl flex items-center justify-center">
                        <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {course.students} students
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  )
}

