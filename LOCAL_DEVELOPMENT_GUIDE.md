# Local Development Setup Guide for Silverleaf Faculty Portal

This guide will help you download, set up, and run the Faculty Portal locally using Cursor (or any code editor) with a real database.

---

## Step 1: Download the Project

### Option A: Download ZIP from v0
1. In v0, click the **three dots** in the top right corner
2. Select **"Download ZIP"**
3. Extract the ZIP file to your desired location

### Option B: Push to GitHub (Recommended)
1. In v0, click the **GitHub icon** in the top right
2. Connect your GitHub account
3. Push the project to a new repository
4. Clone it locally:
\`\`\`bash
git clone https://github.com/your-username/faculty-portal.git
cd faculty-portal
\`\`\`

---

## Step 2: Open in Cursor

1. Open **Cursor** editor
2. File → Open Folder → Select your project folder
3. Cursor will recognize it as a Next.js project

---

## Step 3: Install Dependencies

Open the integrated terminal in Cursor (Ctrl+` or Cmd+`) and run:

\`\`\`bash
npm install
\`\`\`

This installs all required packages:
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Groq API (for AI features)
- pdf-parse (for PDF reading)

---

## Step 4: Choose and Setup Database

You have three options. I recommend **Supabase** (easiest and free):

### **Option A: Supabase (Recommended - Free & Easy)**

#### 4.1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up / Login
3. Click "New Project"
4. Fill in:
   - **Project Name**: `silverleaf-faculty-portal`
   - **Database Password**: (choose a strong password)
   - **Region**: Choose closest to you
5. Wait 2-3 minutes for setup

#### 4.2: Get Database Credentials
1. In your Supabase project, go to **Settings** → **Database**
2. Scroll to **Connection String** → **URI**
3. Copy the connection string (looks like: `postgresql://postgres:[password]@...`)

#### 4.3: Run Database Setup Script
1. In Supabase, go to **SQL Editor**
2. Click **"New Query"**
3. Copy the contents of `scripts/01_create_tables.sql` from your project
4. Paste into Supabase SQL Editor
5. Click **"Run"** to create all tables

The script creates these tables:
- `users` - Professor accounts
- `courses` - Course information
- `assignments` - Assignment details
- `submissions` - Student submissions
- `feedback` - Grading feedback

#### 4.4: Add Sample Data (Optional)
Run this in Supabase SQL Editor:

\`\`\`sql
-- Insert a test professor account
INSERT INTO users (email, password_hash, full_name, role)
VALUES (
  'professor@silverleaf.edu',
  '$2a$10$rZ8qK9Z8Q9Z8Q9Z8Q9Z8Qu',  -- hashed "password123"
  'Dr. John Smith',
  'professor'
);

-- Insert sample courses
INSERT INTO courses (professor_id, name, code, duration, syllabus_text)
SELECT 
  id,
  'Introduction to Computer Science',
  'CS101',
  '12 weeks',
  'Week 1: Introduction to Programming...'
FROM users WHERE email = 'professor@silverleaf.edu';
\`\`\`

---

### **Option B: Neon (Serverless PostgreSQL)**

1. Go to [neon.tech](https://neon.tech)
2. Create account and new project
3. Copy the connection string
4. Use Neon's SQL Editor to run `scripts/01_create_tables.sql`

---

### **Option C: Local PostgreSQL**

1. Install PostgreSQL locally
2. Create database: `createdb faculty_portal`
3. Run script: `psql faculty_portal < scripts/01_create_tables.sql`
4. Connection string: `postgresql://localhost:5432/faculty_portal`

---

## Step 5: Configure Environment Variables

Create a **`.env.local`** file in your project root (same level as `package.json`):

\`\`\`bash
# .env.local

# Database Connection
DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]/[DATABASE]"

# Groq AI API Key
GROQ_API_KEY="your_groq_api_key_here"

# File Upload Storage (Optional - for production)
# BLOB_READ_WRITE_TOKEN="your_vercel_blob_token"
\`\`\`

### Get Groq API Key:
1. Go to [https://console.groq.com](https://console.groq.com)
2. Sign in and navigate to API Keys
3. Click "Create API Key"
4. Copy the key and paste into `.env.local`

### Example `.env.local`:
\`\`\`
DATABASE_URL="postgresql://postgres:mypassword@db.supabase.co:5432/postgres"
GROQ_API_KEY="gsk_your_api_key_here"
\`\`\`

**Important:** Never commit `.env.local` to Git (it's already in `.gitignore`)

---

## Step 6: Update Database Connection Code

The project uses a placeholder database file. Update **`lib/db.ts`**:

\`\`\`typescript
// lib/db.ts
import postgres from 'postgres'

// For local development, use environment variable
const connectionString = process.env.DATABASE_URL!

if (!connectionString) {
  throw new Error('DATABASE_URL is not set. Add it to .env.local')
}

// Create database connection
export const sql = postgres(connectionString, {
  max: 10, // Maximum connections
  idle_timeout: 20,
  connect_timeout: 10,
})

// Helper functions
export async function query(text: string, params?: any[]) {
  try {
    const result = await sql.unsafe(text, params)
    return result
  } catch (error) {
    console.error('[v0] Database query error:', error)
    throw error
  }
}
\`\`\`

Install the postgres library:
\`\`\`bash
npm install postgres
\`\`\`

---

## Step 7: Update API Routes to Use Real Database

### Example: Update `app/api/auth/login/route.ts`

\`\`\`typescript
import { sql } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()
    
    // Query real database
    const users = await sql`
      SELECT * FROM users 
      WHERE email = ${email} 
      LIMIT 1
    `
    
    if (users.length === 0) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }
    
    const user = users[0]
    
    // In production, use bcrypt to compare password
    // For now, simple comparison (add bcrypt later)
    if (password === 'password123') {
      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.full_name
        }
      })
    }
    
    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    )
    
  } catch (error) {
    console.error('[v0] Login error:', error)
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}
\`\`\`

### Example: Update `app/api/courses/route.ts`

\`\`\`typescript
import { sql } from '@/lib/db'
import { NextResponse } from 'next/server'

// GET all courses
export async function GET(req: Request) {
  try {
    const courses = await sql`
      SELECT * FROM courses 
      ORDER BY created_at DESC
    `
    
    return NextResponse.json({ courses })
  } catch (error) {
    console.error('[v0] Fetch courses error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    )
  }
}

// POST create new course
export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const name = formData.get('name') as string
    const code = formData.get('code') as string
    const duration = formData.get('duration') as string
    const syllabusFile = formData.get('syllabus') as File
    
    // Extract text from PDF
    const syllabusText = await extractPDFText(syllabusFile)
    
    // Insert into database
    const result = await sql`
      INSERT INTO courses (
        professor_id, 
        name, 
        code, 
        duration, 
        syllabus_text
      )
      VALUES (
        1, -- hardcoded professor_id for now
        ${name},
        ${code},
        ${duration},
        ${syllabusText}
      )
      RETURNING *
    `
    
    return NextResponse.json({ 
      success: true, 
      course: result[0] 
    })
    
  } catch (error) {
    console.error('[v0] Create course error:', error)
    return NextResponse.json(
      { error: 'Failed to create course' },
      { status: 500 }
    )
  }
}
\`\`\`

---

## Step 8: Run the Development Server

\`\`\`bash
npm run dev
\`\`\`

The app will start on **http://localhost:3000**

Open in your browser and test:
1. Login page should appear
2. Use: `professor@silverleaf.edu` / `password123`
3. Should see courses dashboard
4. Add a new course with syllabus PDF
5. Test chatbot and feedback analyzer

---

## Step 9: Development Workflow in Cursor

### Using Cursor AI Assistant

1. **Ask questions**: Press `Cmd+K` (Mac) or `Ctrl+K` (Windows)
2. **Code generation**: Select code, press `Cmd+K`, ask to modify
3. **Chat with codebase**: Use Chat sidebar to ask about any file
4. **Autocomplete**: Cursor's AI will suggest code as you type

### File Structure
\`\`\`
faculty-portal/
├── app/
│   ├── api/           # Backend API routes
│   │   ├── auth/
│   │   ├── courses/
│   │   ├── chat/
│   │   └── analyze-assignment/
│   ├── layout.tsx     # Root layout
│   ├── page.tsx       # Main entry point
│   └── globals.css    # Global styles
├── components/        # React components
│   ├── ui/           # shadcn components
│   ├── login-page.tsx
│   ├── course-dashboard.tsx
│   └── ...
├── lib/              # Utilities
│   ├── db.ts         # Database connection
│   └── utils.ts
├── scripts/          # Database scripts
│   └── 01_create_tables.sql
├── .env.local        # Environment variables (create this)
├── package.json
└── tsconfig.json
\`\`\`

### Common Development Tasks

**Add new feature:**
1. Create component in `components/`
2. Import and use in parent component
3. Hot reload shows changes instantly

**Add new API endpoint:**
1. Create file in `app/api/your-endpoint/route.ts`
2. Export GET/POST/etc functions
3. Access at `/api/your-endpoint`

**Database changes:**
1. Modify `scripts/01_create_tables.sql`
2. Run in Supabase SQL Editor
3. Update queries in API routes

**Styling changes:**
1. Use Tailwind classes directly in components
2. Or add custom CSS in `app/globals.css`
3. Changes appear instantly with hot reload

---

## Step 10: Testing the Full Flow

### Test Course Creation with Syllabus:
1. Login to the portal
2. Click "Add New Course"
3. Fill in course details
4. Upload a PDF syllabus (any PDF for testing)
5. Submit
6. Course should appear in dashboard

### Test Chatbot:
1. Click on a course
2. Go to "Chatbot" tab
3. Ask: "What topics are covered in week 1?"
4. Chatbot should respond based on uploaded syllabus

### Test Feedback Analyzer:
1. Go to "Feedback Analyzer" tab
2. Click on an assignment
3. Click "Analyze Feedback"
4. Paste a grading rubric
5. AI should grade all submissions

---

## Troubleshooting

### "Cannot find module 'postgres'"
\`\`\`bash
npm install postgres
\`\`\`

### "GROQ_API_KEY is not defined"
- Check `.env.local` exists in project root
- Verify key is correct
- Restart dev server: `npm run dev`

### "Database connection failed"
- Verify `DATABASE_URL` in `.env.local`
- Test connection in Supabase dashboard
- Check if IP is whitelisted (Supabase auto-allows all)

### "PDF parsing not working"
\`\`\`bash
npm install pdf-parse
\`\`\`

### Hot reload not working
- Restart dev server
- Clear `.next` cache: `rm -rf .next && npm run dev`

---

## Production Deployment

### Deploy to Vercel (Recommended):

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your GitHub repository
4. Add environment variables:
   - `DATABASE_URL`
   - `GROQ_API_KEY`
5. Deploy

Vercel automatically:
- Builds the Next.js app
- Provides HTTPS
- Manages environment variables
- Auto-deploys on Git push

---

## Next Steps

1. **Add Password Hashing**: Use `bcrypt` for secure passwords
2. **Add File Storage**: Use Vercel Blob for PDF storage
3. **Add Authentication**: Use NextAuth.js or Supabase Auth
4. **Add Session Management**: Store user sessions
5. **Add Authorization**: Role-based access control
6. **Add Validation**: Zod for input validation
7. **Add Error Handling**: Better error messages
8. **Add Loading States**: Skeletons and spinners
9. **Add Tests**: Unit and integration tests
10. **Add Analytics**: Track usage patterns

---

## Database Schema Reference

\`\`\`sql
-- Users (Professors)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'professor',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Courses
CREATE TABLE courses (
  id SERIAL PRIMARY KEY,
  professor_id INTEGER REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) NOT NULL,
  duration VARCHAR(100),
  syllabus_text TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Assignments
CREATE TABLE assignments (
  id SERIAL PRIMARY KEY,
  course_id INTEGER REFERENCES courses(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  due_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Submissions
CREATE TABLE submissions (
  id SERIAL PRIMARY KEY,
  assignment_id INTEGER REFERENCES assignments(id),
  student_name VARCHAR(255) NOT NULL,
  student_id VARCHAR(100) NOT NULL,
  file_url TEXT,
  submitted_at TIMESTAMP DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'submitted'
);

-- Feedback
CREATE TABLE feedback (
  id SERIAL PRIMARY KEY,
  submission_id INTEGER REFERENCES submissions(id),
  score INTEGER,
  errors_count INTEGER,
  strengths TEXT[],
  improvements TEXT[],
  feedback_text TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

---

## Support

If you encounter issues:
1. Check console for errors (F12 → Console)
2. Check terminal for server errors
3. Review this guide carefully
4. Search Stack Overflow for specific errors
5. Check Next.js documentation: [nextjs.org/docs](https://nextjs.org/docs)

---

Happy coding! 🚀
