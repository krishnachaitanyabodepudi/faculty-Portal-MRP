"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart3, TrendingUp, Star, MessageCircle, ThumbsUp, ThumbsDown, Filter } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface FeedbackItem {
  id: string
  studentName: string
  course: string
  rating: number
  sentiment: "positive" | "neutral" | "negative"
  category: string
  comment: string
  date: string
  responded: boolean
}

const feedbackData: FeedbackItem[] = [
  {
    id: "1",
    studentName: "Sarah Johnson",
    course: "Computer Science 101",
    rating: 5,
    sentiment: "positive",
    category: "Teaching Style",
    comment:
      "Excellent explanations and very approachable. The practical examples really helped me understand complex concepts.",
    date: "2025-01-15",
    responded: true,
  },
  {
    id: "2",
    studentName: "Michael Chen",
    course: "Data Structures",
    rating: 4,
    sentiment: "positive",
    category: "Course Content",
    comment: "Great course material, but could use more practice problems for exam preparation.",
    date: "2025-01-14",
    responded: false,
  },
  {
    id: "3",
    studentName: "Emily Rodriguez",
    course: "Computer Science 101",
    rating: 3,
    sentiment: "neutral",
    category: "Assignments",
    comment: "Assignments are challenging but sometimes unclear. More detailed instructions would help.",
    date: "2025-01-13",
    responded: false,
  },
  {
    id: "4",
    studentName: "David Kim",
    course: "Algorithms",
    rating: 5,
    sentiment: "positive",
    category: "Teaching Style",
    comment: "Best professor I've had! Makes difficult topics easy to understand and is always willing to help.",
    date: "2025-01-12",
    responded: true,
  },
  {
    id: "5",
    studentName: "Jessica Brown",
    course: "Data Structures",
    rating: 2,
    sentiment: "negative",
    category: "Pace",
    comment: "The course moves too fast. Hard to keep up with the material.",
    date: "2025-01-11",
    responded: false,
  },
  {
    id: "6",
    studentName: "Alex Turner",
    course: "Algorithms",
    rating: 5,
    sentiment: "positive",
    category: "Course Content",
    comment: "Fantastic course! The real-world applications make everything click.",
    date: "2025-01-10",
    responded: true,
  },
]

const courseStats = [
  { course: "Computer Science 101", avgRating: 4.5, totalFeedback: 45, positive: 85 },
  { course: "Data Structures", avgRating: 4.2, totalFeedback: 38, positive: 78 },
  { course: "Algorithms", avgRating: 4.8, totalFeedback: 42, positive: 92 },
]

export function FeedbackAnalyzer() {
  const [selectedCourse, setSelectedCourse] = useState<string>("all")
  const [selectedSentiment, setSelectedSentiment] = useState<string>("all")

  const filteredFeedback = feedbackData.filter((item) => {
    const courseMatch = selectedCourse === "all" || item.course === selectedCourse
    const sentimentMatch = selectedSentiment === "all" || item.sentiment === selectedSentiment
    return courseMatch && sentimentMatch
  })

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return <ThumbsUp className="h-4 w-4 text-green-500" />
      case "negative":
        return <ThumbsDown className="h-4 w-4 text-red-500" />
      default:
        return <MessageCircle className="h-4 w-4 text-yellow-500" />
    }
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "bg-green-500/10 text-green-700 border-green-500/20"
      case "negative":
        return "bg-red-500/10 text-red-700 border-red-500/20"
      default:
        return "bg-yellow-500/10 text-yellow-700 border-yellow-500/20"
    }
  }

  return (
    <div className="space-y-6">
      {/* Analytics Overview */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-2 border-primary/20 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              Average Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-4xl font-bold text-primary">4.5</div>
              <div className="flex items-center gap-1 text-green-600">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm font-semibold">+0.3</span>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className={`h-5 w-5 ${star <= 4.5 ? "fill-accent text-accent" : "text-muted"}`} />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-secondary/20 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-secondary" />
              Total Feedback
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-secondary">125</div>
            <p className="text-sm text-muted-foreground mt-2">Across all courses</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-500/20 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ThumbsUp className="h-4 w-4 text-green-600" />
              Positive Sentiment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-green-600">85%</div>
            <Progress value={85} className="mt-3 h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Course Statistics */}
      <Card className="border-2 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Course Performance
          </CardTitle>
          <CardDescription>Detailed statistics for each course</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {courseStats.map((stat) => (
              <div key={stat.course} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-foreground">{stat.course}</h4>
                    <p className="text-sm text-muted-foreground">{stat.totalFeedback} responses</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-accent text-accent" />
                      <span className="font-bold text-lg">{stat.avgRating}</span>
                    </div>
                    <Badge className="bg-green-500/10 text-green-700 border-green-500/20">
                      {stat.positive}% positive
                    </Badge>
                  </div>
                </div>
                <Progress value={stat.positive} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Feedback List */}
      <Card className="border-2 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-primary" />
                Student Feedback
              </CardTitle>
              <CardDescription>Review and respond to student comments</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  <SelectItem value="Computer Science 101">CS 101</SelectItem>
                  <SelectItem value="Data Structures">Data Structures</SelectItem>
                  <SelectItem value="Algorithms">Algorithms</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedSentiment} onValueChange={setSelectedSentiment}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by sentiment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sentiments</SelectItem>
                  <SelectItem value="positive">Positive</SelectItem>
                  <SelectItem value="neutral">Neutral</SelectItem>
                  <SelectItem value="negative">Negative</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredFeedback.map((item) => (
              <Card key={item.id} className="border shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <h4 className="font-semibold text-foreground">{item.studentName}</h4>
                          <Badge variant="outline" className="text-xs">
                            {item.course}
                          </Badge>
                          <Badge className={getSentimentColor(item.sentiment)}>
                            <span className="flex items-center gap-1">
                              {getSentimentIcon(item.sentiment)}
                              {item.sentiment}
                            </span>
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${star <= item.rating ? "fill-accent text-accent" : "text-muted"}`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-muted-foreground">{item.date}</span>
                        </div>
                      </div>
                      {item.responded && (
                        <Badge className="bg-primary/10 text-primary border-primary/20">Responded</Badge>
                      )}
                    </div>
                    <div className="rounded-lg bg-muted/50 p-4 border">
                      <p className="text-sm font-medium text-muted-foreground mb-1">Category: {item.category}</p>
                      <p className="text-foreground leading-relaxed">{item.comment}</p>
                    </div>
                    {!item.responded && (
                      <Button size="sm" className="w-full sm:w-auto">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Respond to Feedback
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
