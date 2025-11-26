# Silver Leaf University – Faculty & Student Portal

This project is a small full‑stack prototype for managing courses, assignments and feedback at “Silver Leaf University”.  
It’s built as a realistic demo for an IS/IT course project – the goal is to **show the main flows working end‑to‑end**, not to be a production system.

I’ve tried to keep the code clean and easy to follow so that anyone looking at the repo can quickly understand how the pieces fit together.

---

## Live prototype

The deployed prototype is available here: [https://faculty-portal-mrp.vercel.app](https://faculty-portal-mrp.vercel.app)

You can log in with the demo accounts below (these are backed by the JSON data under `dataset/`).

- **Faculty (example)**
  - Email: `sarah.mitchell@university.edu`
  - Password: `faculty101`

- **Student (example)**
  - Email: `john.smith@university.edu`
  - Password: `password`

- **Admin**
  - Email: `admin@university.edu`
  - Password: `admin123`

---

## What this prototype does

- **Role‑based access**
  - Faculty login → see their courses, drill into a course, run feedback analysis, chat with an assistant, post announcements.
  - Students login → see enrolled courses, submit assignments, read course announcements, and send mails to faculty.

- **Faculty dashboard**
  - “My Courses” view with duration and strength (student count).
  - Per‑course detail page with tabs:
    - **Syllabus** – text loaded from syllabus files.
    - **Assignments** – list of assignments for the course.
    - **Assistant** – course‑aware chatbot for faculty questions.
    - **Feedback Analyzer** – runs AI feedback on a batch of submissions.
    - **Announcements** – post announcements for that specific course.

- **Student portal**
  - Course grid showing all enrolled subjects.
  - Inside a course:
    - **Assignments tab** – submit a PDF and see submission status.
    - **Announcements tab** – **read‑only** view of course announcements posted by faculty.
  - **Mailbox** on the right side:
    - Students can send a mail (To / Subject / Message) to faculty/support.
    - Shows recent mails they sent and any mails addressed to their email.

- **Faculty Mail (global)**
  - From the home dashboard’s **Mail** tab:
    - Compose mail to any recipient email (To / Subject / Message, optional file name shown).
    - See a “recent mails” list with who sent what to whom.

- **AI‑powered feedback**
  - Faculty can run a feedback analysis job over multiple student submissions.
  - The system calls Gemini with rubric + syllabus context and returns:
    - Overall summary,
    - Per‑student feedback and approximate score,
    - Option to download an annotated PDF for each student.

---

## Tech stack (quick view)

- **Framework**: Next.js (App Router)
- **Language**: TypeScript + React 19
- **UI**: Tailwind CSS + shadcn/ui components + Lucide icons
- **AI**: Google Gemini 2.0 Flash (`@google/generative-ai`) via server‑side API routes
- **Storage for this prototype**:
  - JSON files under `dataset/` act as a fake database:
    - `dataset/courses/courses.json`
    - `dataset/assignments/...`
    - `dataset/students/students.json`
    - `dataset/faculty/faculty.json`
    - `dataset/submissions/...` (PDFs + extracted text)
    - `dataset/announcements/announcements.json`
  - File uploads for submissions are written to the filesystem in development.
  - For a real deployment, this should be swapped to a database + blob storage.

---

## Project structure (high level)

- `app/`
  - `page.tsx` – entry page; handles faculty login and shows `CourseDashboard`.
  - `student/page.tsx` – entry for student portal.
  - `admin/` – admin portal shell.
  - `api/` – server routes (courses, assignments, submissions, rubrics, chat, analyze‑assignment, announcements, etc.).

- `components/`
  - `course-dashboard.tsx` – main faculty home screen with **Courses / Mail** tabs.
  - `course-detail-view.tsx` – per‑course view for faculty (tabs: Syllabus, Assignments, Assistant, Feedback Analyzer, Announcements).
  - `student-dashboard.tsx` – main student portal UI, including per‑course view + Mailbox.
  - `chat-interface.tsx`, `chatbot-tab.tsx` – chatbot UI.
  - `feedback-analysis-dialog.tsx`, `feedback-analyzer.tsx` – feedback analysis flow.
  - `announcements-panel.tsx` – shared mail/announcement panel (behaves differently in “mail” vs “course announcement” mode).
  - `student-login.tsx`, `login-page.tsx`, `admin-login.tsx` – role‑based login components.

- `lib/`
  - `gemini-utils.ts` – small helpers for talking to Gemini.
  - `file-storage.ts` – helpers for file paths / storage abstraction (room to swap in blob storage later).

---

## Getting it running locally

### 1. Install dependencies

```bash
npm install
```

Node 18+ is recommended (Next.js requirement).

### 2. Environment variables

Create a `.env.local` file in the project root (this file is **git‑ignored**):

```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

- The key is **only** read on the server, inside `app/api/*` routes.
- Frontend components never see the raw key; they just call our own API endpoints.

### 3. Start the dev server

```bash
npm run dev
```

Then open `http://localhost:3000` in the browser.

### 4. Test logins (using the JSON “database”)

The actual IDs/emails are defined in the JSON files under `dataset/`:

- Faculty accounts are in `dataset/faculty/faculty.json`.
- Student accounts are in `dataset/students/students.json`.

The login components simply look up the entered credentials against those JSON files.

---

## How data flows (simplified)

- **Courses / students / assignments**
  - API routes (e.g. `app/api/courses/route.ts`, `app/api/assignments/route.ts`) read and write the JSON files under `dataset/`.
  - This keeps the prototype self‑contained and easy to reset.

- **Submissions**
  - When a student uploads a PDF, the server saves it under `dataset/submissions/...` and stores some metadata.
  - The feedback analyzer later reads those PDFs and sends the content to Gemini.

- **Announcements & mail**
  - `/api/announcements` reads/writes `dataset/announcements/announcements.json`.
  - For **course announcements**:
    - Faculty post from the course Announcements tab with a `courseId`.
    - Students enrolled in that course see these in the per‑course Announcements tab.
  - For **mail**:
    - Faculty Mail tab and Student Mailbox both send to `/api/announcements` with `toEmail`.
    - Each side filters the list to show only relevant messages (sent by or sent to that user).
  - This is intentionally implemented as in‑app messaging, not real SMTP email.

---

## Deployment notes

The project was designed to deploy on **Vercel**:

- Next.js App Router works well with Vercel’s serverless runtime.
- Environment variables are configured in the Vercel dashboard (same names as `.env.local`).
- Because the prototype currently writes to the filesystem (for JSON and uploads), full persistence is guaranteed **only in local development**.
  - On Vercel, writes to the serverless filesystem are ephemeral.
  - For a serious deployment, announcements, submissions and users should live in:
    - A real database (PostgreSQL / Supabase / Neon, etc.), and
    - Blob/file storage for PDFs (e.g. Vercel Blob or S3‑compatible storage).

---

## Things to improve (if this was taken further)

I’ve kept this prototype focused on clarity rather than cleverness. If this were turned into an MVP, the next steps would probably be:

- Replace JSON + local file writes with a real database and blob storage.
- Add proper auth (sessions, JWT, or NextAuth) instead of trusting local JSON users.
- Tighten role checks on API routes (e.g. only faculty can post course announcements).
- Add pagination / search for mails and announcements.
- Harden error handling and UX states around failed AI calls or missing API keys.

For the current assignment, though, the main flows (faculty dashboard, student portal, submissions, feedback analysis, mail and course announcements) are all implemented and demonstrable end‑to‑end.


