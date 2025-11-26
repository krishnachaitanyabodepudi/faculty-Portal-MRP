import { NextResponse } from "next/server"
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs"
import { join, dirname } from "path"

interface Announcement {
  id: string
  title: string
  message: string
  courseId?: string | null
  createdAt: string
  senderRole: "faculty" | "student"
  senderId?: string | null
  senderName?: string | null
  target: "students" | "faculty" | "all"
  toEmail?: string | null
}

const ANNOUNCEMENTS_PATH = join(process.cwd(), "dataset", "announcements", "announcements.json")

function loadAnnouncements(): Announcement[] {
  try {
    if (!existsSync(ANNOUNCEMENTS_PATH)) {
      const dir = dirname(ANNOUNCEMENTS_PATH)
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true })
      }
      writeFileSync(ANNOUNCEMENTS_PATH, "[]", "utf-8")
      return []
    }
    const raw = readFileSync(ANNOUNCEMENTS_PATH, "utf-8")
    return JSON.parse(raw)
  } catch (error) {
    console.error("Failed to load announcements:", error)
    return []
  }
}

function saveAnnouncements(items: Announcement[]) {
  try {
    const dir = dirname(ANNOUNCEMENTS_PATH)
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true })
    }
    writeFileSync(ANNOUNCEMENTS_PATH, JSON.stringify(items, null, 2), "utf-8")
  } catch (error) {
    console.error("Failed to save announcements:", error)
  }
}

// GET /api/announcements?course_id=C101 (optional)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get("course_id")

    const all = loadAnnouncements()
      // Ensure older records without sender info still have sensible defaults
      .map((a: any) => ({
        ...a,
        senderRole: a.senderRole || "faculty",
        target: a.target || "students",
      })) as Announcement[]

    const filtered = courseId
      ? all.filter((a) => !a.courseId || a.courseId === courseId)
      : all

    // Return newest first
    const sorted = [...filtered].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    return NextResponse.json({ announcements: sorted })
  } catch (error) {
    console.error("Error fetching announcements:", error)
    return NextResponse.json({ error: "Failed to fetch announcements" }, { status: 500 })
  }
}

// POST /api/announcements
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, message, courseId, senderRole, senderId, senderName, target, toEmail } = body || {}

    if (!title || !message) {
      return NextResponse.json(
        { error: "title and message are required" },
        { status: 400 }
      )
    }

    const role: "faculty" | "student" =
      senderRole === "student" ? "student" : "faculty"

    const audience: "students" | "faculty" | "all" =
      target === "faculty" || target === "all" ? target : "students"

    const all = loadAnnouncements()
    const now = new Date().toISOString()

    const newAnnouncement: Announcement = {
      id: `A${Date.now()}`,
      title: String(title),
      message: String(message),
      courseId: courseId ? String(courseId) : null,
      createdAt: now,
      senderRole: role,
      senderId: senderId ? String(senderId) : null,
      senderName: senderName ? String(senderName) : null,
      target: audience,
      toEmail: toEmail ? String(toEmail) : null,
    }

    all.push(newAnnouncement)
    saveAnnouncements(all)

    return NextResponse.json({ success: true, announcement: newAnnouncement })
  } catch (error) {
    console.error("Error creating announcement:", error)
    return NextResponse.json(
      { error: "Failed to create announcement" },
      { status: 500 }
    )
  }
}


