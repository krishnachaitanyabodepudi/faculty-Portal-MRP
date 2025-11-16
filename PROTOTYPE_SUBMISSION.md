# Interactive Prototype Submission
## Silver Leaf University Faculty Portal - IS/IT Solution

---

## 🔗 **Prototype Link**

**Live Prototype URL:** `https://faculty-portal-mrp.vercel.app` (or your Vercel deployment URL)

**GitHub Repository:** https://github.com/krishnachaitanyabodepudi/faculty-Portal-MRP

---

## 📋 **System Overview**

**Solution Name:** Silver Leaf University Faculty Portal with AI-Powered Feedback Analysis

**Purpose:** A comprehensive faculty management system that enables professors to manage courses, analyze student submissions using AI, and interact with a syllabus-aligned assistant.

**Technology Stack:**
- **Frontend:** Next.js 15.5.4, React 19, TypeScript
- **UI Framework:** Tailwind CSS, shadcn/ui (Radix UI)
- **Backend:** Next.js API Routes
- **AI Integration:** Google Gemini 2.0 Flash
- **Data Storage:** JSON files (dataset/)
- **Deployment:** Vercel

---

## 👥 **Role-Based Interfaces**

### **1. Faculty/Professor Role**

**Login Credentials:**
- **Email:** `sarah.mitchell@university.edu` (or any faculty email from dataset)
- **Password:** `faculty101` (for F101), `faculty102` (for F102), etc.

**Key Features:**
- Course Dashboard
- Syllabus Management
- Assignment Management
- AI-Powered Feedback Analyzer
- Syllabus-Aligned Assistant (Chatbot)
- Student Submission Review

---

### **2. Student Role**

**Login Credentials:**
- **Email:** `john.smith@university.edu` (or any student email from dataset)
- **Password:** `password` (default for all students)

**Key Features:**
- View Enrolled Courses
- View Assignments
- Submit Assignments
- View Feedback

---

### **3. Admin Role**

**Login Credentials:**
- **Email:** `admin@university.edu`
- **Password:** `admin123`

**Key Features:**
- Faculty Management
- Course Creation
- System Overview

---

## 🖥️ **Screen-by-Screen Documentation**

### **Screen 1: Landing/Login Page**

**URL:** `/` (Root)

**Component:** `components/login-page.tsx`

**User Interaction:**
1. User arrives at the landing page
2. Selects login type: **Faculty**, **Student**, or **Admin**
3. Enters email and password
4. Clicks "Sign In"
5. System authenticates and redirects to role-specific dashboard

**Data Integration:**
- **API Endpoint:** `/api/auth/login`, `/api/auth/student`, `/api/auth/admin`
- **Data Source:** 
  - Faculty: `dataset/faculty/faculty.json`
  - Students: `dataset/students/students.json`
  - Admin: Hardcoded credentials
- **Authentication:** SHA-256 password hashing
- **Response:** Returns user object with `id`, `email`, `name`, `role`

**Architecture Section:** Authentication & Authorization Layer

---

### **Screen 2: Faculty Course Dashboard**

**URL:** `/` (After faculty login)

**Component:** `components/course-dashboard.tsx`

**User Interaction:**
1. Faculty sees list of their courses
2. Each course card shows: Course Name, Code, Duration, Student Count
3. Click on a course card to view details
4. Options to add new course or delete existing courses
5. Notification badge shows pending items

**Data Integration:**
- **API Endpoint:** `/api/courses?faculty_id={faculty_id}`
- **Data Source:** `dataset/courses/courses.json`
- **Filtering:** Courses filtered by `faculty_id`
- **Data Structure:**
  ```json
  {
    "id": "C101",
    "name": "Introduction to Computer Science",
    "code": "CS101",
    "duration": "12 weeks",
    "students": 45
  }
  ```

**Architecture Section:** Course Management Module, Data Retrieval Layer

---

### **Screen 3: Course Detail View**

**URL:** `/` (After selecting a course)

**Component:** `components/course-detail-view.tsx`

**User Interaction:**
1. Four main tabs:
   - **Syllabus Tab:** View course syllabus (PDF/text)
   - **Assignments Tab:** View and manage assignments
   - **Assistant Tab:** AI chatbot for course questions
   - **Feedback Analyzer Tab:** Analyze student submissions
2. Navigate between tabs using tab navigation
3. Back button returns to course dashboard

**Data Integration:**
- **API Endpoints:**
  - `/api/courses/{course_id}` - Course details
  - `/api/assignments?course_id={course_id}` - Assignments
  - `/api/syllabus/pdf?course_id={course_id}` - Syllabus PDF
- **Data Sources:**
  - `dataset/courses/courses.json`
  - `dataset/assignments/assignments.json`
  - `dataset/syllabus/{course_id}/syllabus.pdf`

**Architecture Section:** Course Detail Module, Multi-Tab Interface

---

### **Screen 4: Syllabus Tab**

**Component:** `components/syllabus-tab.tsx`

**User Interaction:**
1. Displays course syllabus in structured format
2. Shows: Course Description, Learning Objectives, Weekly Topics, Grading Breakdown
3. Can view PDF version
4. Syllabus content is parsed and displayed in organized sections

**Data Integration:**
- **API Endpoint:** `/api/courses/{course_id}`
- **Data Source:** 
  - `dataset/syllabus/{course_id}/syllabus.json`
  - `dataset/syllabus/{course_id}/syllabus.txt`
  - `dataset/syllabus/{course_id}/syllabus.pdf`
- **Data Processing:** Text parsing, section extraction, formatting

**Architecture Section:** Document Management, Content Parsing

---

### **Screen 5: Assignments Tab**

**Component:** `components/assignments-tab.tsx`

**User Interaction:**
1. Lists all assignments for the course
2. Each assignment shows: Title, Description, Due Date, Max Score
3. Click "View Details" to see full assignment
4. Click "Add Assignment" to create new assignment
5. Can delete assignments

**Data Integration:**
- **API Endpoint:** `/api/assignments?course_id={course_id}`
- **Data Source:** `dataset/assignments/assignments.json`
- **Data Structure:**
  ```json
  {
    "assignment_id": "C101_A01",
    "title": "Introduction to Programming",
    "description": "...",
    "due_date": "2024-02-15",
    "max_score": 100
  }
  ```

**Architecture Section:** Assignment Management, CRUD Operations

---

### **Screen 6: AI Assistant (Chatbot) Tab**

**Component:** `components/chatbot-tab.tsx`

**User Interaction:**
1. Chat interface with message history
2. Type question in input field
3. Click "Send" or press Enter
4. AI responds with syllabus-aligned answers
5. Streaming response shows real-time text generation
6. Can ask about course topics, assignments, syllabus content

**Data Integration:**
- **API Endpoint:** `/api/chat`
- **Request Data:**
  ```json
  {
    "messages": [
      {"role": "user", "content": "What topics are covered in week 1?"}
    ],
    "courseId": "C101"
  }
  ```
- **AI Model:** Google Gemini 2.0 Flash
- **Context:** Syllabus content loaded from course data
- **Response:** Streaming text response

**Architecture Section:** AI Integration Layer, Natural Language Processing, Context-Aware Chatbot

---

### **Screen 7: Feedback Analyzer Tab**

**Component:** `components/feedback-analyzer-tab.tsx`

**User Interaction:**
1. Select an assignment from dropdown
2. Click "Analyze Feedback" button
3. System loads all student submissions for that assignment
4. AI analyzes each submission
5. Results show:
   - Overall average score
   - Individual student scores
   - Strengths and improvements
   - Detailed feedback for each student
6. Can download annotated PDFs

**Data Integration:**
- **API Endpoints:**
  - `/api/submissions?course_id={course_id}&assignment_id={assignment_id}`
  - `/api/analyze-assignment` - AI analysis
  - `/api/analyze-assignment/generate-pdf` - PDF generation
- **Data Sources:**
  - `dataset/submissions/{course_id}/{assignment_id}/` - Submission files
  - `dataset/rubrics/rubrics.json` - Grading rubrics
  - `dataset/students/students.json` - Student names
- **AI Processing:**
  - Analyzes submission text
  - Extracts scores (0-100)
  - Identifies strengths and improvements
  - Generates detailed feedback

**Architecture Section:** AI-Powered Analysis Engine, Feedback Generation, PDF Processing

---

### **Screen 8: Student Dashboard**

**URL:** `/student`

**Component:** `components/student-dashboard.tsx`

**User Interaction:**
1. Student sees enrolled courses
2. Select a course to view assignments
3. View assignment details
4. Upload submission (PDF/text)
5. View feedback and scores
6. Download annotated PDFs

**Data Integration:**
- **API Endpoints:**
  - `/api/courses/{course_id}` - Course details
  - `/api/assignments?course_id={course_id}` - Assignments
  - `/api/submissions/upload` - Upload submission
- **Data Source:**
  - `dataset/students/students.json` - Enrolled courses
  - `dataset/assignments/assignments.json` - Assignment details

**Architecture Section:** Student Portal, File Upload System

---

### **Screen 9: Admin Portal**

**URL:** `/admin`

**Component:** `components/admin-portal.tsx`

**User Interaction:**
1. View all faculty members
2. Expand faculty to see their courses
3. Add new courses to faculty
4. View system statistics
5. Manage faculty and course data

**Data Integration:**
- **API Endpoints:**
  - `/api/admin/faculty` - All faculty data
  - `/api/courses` (POST) - Create course
- **Data Source:**
  - `dataset/faculty/faculty.json`
  - `dataset/courses/courses.json`

**Architecture Section:** Administrative Interface, Data Management

---

## 🔄 **Key Functional Features & User Flows**

### **Flow 1: Faculty Login → Course Selection → Assignment Analysis**

1. **Login** → Faculty enters credentials
2. **Dashboard** → Select course from list
3. **Course Detail** → Navigate to "Feedback Analyzer" tab
4. **Select Assignment** → Choose assignment from dropdown
5. **Analyze** → Click "Analyze Feedback"
6. **Results** → View AI-generated scores and feedback
7. **Download** → Download annotated PDFs

**Data Flow:**
```
Login → API: /api/auth/login → dataset/faculty/faculty.json
Course List → API: /api/courses → dataset/courses/courses.json
Submissions → API: /api/submissions → dataset/submissions/
Analysis → API: /api/analyze-assignment → AI Processing → Results
```

**Architecture:** Multi-layer data flow, AI processing pipeline

---

### **Flow 2: Student Login → View Assignment → Submit**

1. **Login** → Student enters credentials
2. **Dashboard** → View enrolled courses
3. **Select Course** → Click on course
4. **View Assignments** → See assignment list
5. **Assignment Detail** → Click on assignment
6. **Upload** → Upload PDF/text submission
7. **Confirmation** → Submission confirmed

**Data Flow:**
```
Login → API: /api/auth/student → dataset/students/students.json
Courses → API: /api/courses/{id} → dataset/courses/courses.json
Upload → API: /api/submissions/upload → File Storage
```

**Architecture:** File Upload System, Student Portal

---

### **Flow 3: AI Chatbot Interaction**

1. **Navigate** → Go to "Assistant" tab in course
2. **Ask Question** → Type question about course
3. **AI Response** → Streaming response appears
4. **Follow-up** → Continue conversation
5. **Context-Aware** → AI uses syllabus content

**Data Flow:**
```
Question → API: /api/chat → Load Syllabus Context
Syllabus → API: /api/courses/{id} → dataset/syllabus/
AI Processing → Google Gemini API → Streaming Response
```

**Architecture:** AI Integration, Context Management, Streaming Responses

---

## 📊 **Data Integration Logic**

### **1. Data Entry**

**Course Creation (Admin):**
- Form input → POST `/api/courses`
- Data stored in: `dataset/courses/courses.json`
- Syllabus file uploaded and parsed
- Assignment questions processed

**Assignment Submission (Student):**
- File upload → POST `/api/submissions/upload`
- File stored in: `dataset/submissions/{course_id}/{assignment_id}/`
- Metadata created: `submissions_metadata.json`

**Data Processing:**
- PDF parsing using `pdf-parse`
- Text extraction for AI analysis
- JSON structure creation

---

### **2. Data Retrieval**

**Course Data:**
- GET `/api/courses?faculty_id={id}`
- Reads: `dataset/courses/courses.json`
- Filters by faculty_id
- Returns formatted course list

**Submission Data:**
- GET `/api/submissions?course_id={id}&assignment_id={id}`
- Reads: `dataset/submissions/{course_id}/{assignment_id}/`
- Loads PDF and text files
- Maps to student names from `dataset/students/students.json`

**Student Data:**
- GET `/api/students`
- Reads: `dataset/students/students.json`
- Returns all student records
- Used for name mapping

---

### **3. Data Processing**

**AI Analysis:**
- Input: Submission text, rubric, syllabus context
- Processing: Google Gemini 2.0 Flash model
- Output: Scores, feedback, strengths, improvements
- Storage: Results returned to frontend

**PDF Generation:**
- Input: Submission text, feedback, score, errors
- Processing: `pdf-lib` library
- Output: Annotated PDF with highlights
- Download: Generated PDF sent to user

---

## 🏗️ **Architecture Sections**

### **1. Authentication & Authorization**
- **Files:** `app/api/auth/login/route.ts`, `app/api/auth/student/route.ts`, `app/api/auth/admin/route.ts`
- **Components:** `components/login-page.tsx`, `components/student-login.tsx`, `components/admin-login.tsx`
- **Data:** Password hashing (SHA-256), role-based access

### **2. Course Management**
- **Files:** `app/api/courses/route.ts`, `components/course-dashboard.tsx`, `components/add-course-dialog.tsx`
- **Features:** CRUD operations, course listing, course creation

### **3. Assignment Management**
- **Files:** `app/api/assignments/route.ts`, `components/assignments-tab.tsx`, `components/add-assignment-dialog.tsx`
- **Features:** Assignment listing, creation, deletion

### **4. AI Integration Layer**
- **Files:** `app/api/chat/route.ts`, `app/api/analyze-assignment/route.ts`, `lib/gemini-utils.ts`
- **Features:** Chatbot, feedback analysis, AI processing

### **5. File Processing**
- **Files:** `app/api/submissions/upload/route.ts`, `app/api/analyze-assignment/generate-pdf/route.ts`
- **Features:** PDF parsing, file upload, annotated PDF generation

### **6. Data Layer**
- **Files:** JSON files in `dataset/` directory
- **Structure:** Faculty, Courses, Assignments, Rubrics, Submissions, Students, Syllabi

---

## 🎬 **Video Demonstration Script**

### **Introduction (30 seconds)**
- "This is the Silver Leaf University Faculty Portal"
- "A comprehensive system for managing courses and analyzing student submissions using AI"
- "Let me demonstrate the three main user roles"

### **Part 1: Faculty Role (3-4 minutes)**

1. **Login (30s)**
   - Show login page
   - Select "Faculty" tab
   - Enter: `sarah.mitchell@university.edu` / `faculty101`
   - Click "Sign In"

2. **Course Dashboard (30s)**
   - Show course cards
   - Explain: "Faculty sees all their courses"
   - Click on a course

3. **Course Detail - Syllabus Tab (30s)**
   - Navigate to Syllabus tab
   - Show structured syllabus display
   - Explain: "Syllabus is parsed and displayed in organized sections"

4. **Course Detail - Assignments Tab (30s)**
   - Navigate to Assignments tab
   - Show assignment list
   - Click "View Details" on an assignment

5. **AI Assistant Tab (1 minute)**
   - Navigate to Assistant tab
   - Type: "What topics are covered in week 1?"
   - Show streaming AI response
   - Explain: "AI uses syllabus context to answer questions"

6. **Feedback Analyzer (2 minutes)**
   - Navigate to Feedback Analyzer tab
   - Select an assignment
   - Click "Analyze Feedback"
   - Show loading state
   - Show results: scores, strengths, improvements
   - Click "Download Annotated PDF"
   - Explain: "AI analyzes all submissions and provides detailed feedback"

### **Part 2: Student Role (2 minutes)**

1. **Student Login (30s)**
   - Logout from faculty
   - Select "Student" tab
   - Enter: `john.smith@university.edu` / `password`
   - Click "Sign In"

2. **Student Dashboard (1 minute)**
   - Show enrolled courses
   - Click on a course
   - Show assignments
   - Click on an assignment
   - Show submission interface
   - Explain: "Students can view assignments and submit work"

3. **View Feedback (30s)**
   - Show feedback display
   - Explain: "Students can see AI-generated feedback"

### **Part 3: Admin Role (1 minute)**

1. **Admin Login (20s)**
   - Logout from student
   - Select "Admin" tab
   - Enter: `admin@university.edu` / `admin123`

2. **Admin Portal (40s)**
   - Show faculty list
   - Expand a faculty member
   - Show their courses
   - Explain: "Admins can manage faculty and courses"

### **Conclusion (30 seconds)**
- "This prototype demonstrates core functionality"
- "All features are working and integrated"
- "Ready for MVP refinement"

**Total Video Length:** 6-7 minutes

---

## 📝 **Brief User Interaction Notes**

### **For Faculty:**
1. Login with faculty credentials
2. View courses on dashboard
3. Click course to access: Syllabus, Assignments, AI Assistant, Feedback Analyzer
4. Use AI Assistant for course questions
5. Analyze student submissions with one click
6. Download annotated PDFs with feedback

### **For Students:**
1. Login with student credentials
2. View enrolled courses
3. Access assignments
4. Upload submissions
5. View AI-generated feedback

### **For Admin:**
1. Login with admin credentials
2. View all faculty members
3. Manage courses
4. Add new courses to faculty

---

## 🔗 **Architecture Mapping**

| Screen/Feature | Architecture Section | Files |
|---------------|---------------------|-------|
| Login Page | Authentication Layer | `app/api/auth/*/route.ts`, `components/login-page.tsx` |
| Course Dashboard | Course Management | `app/api/courses/route.ts`, `components/course-dashboard.tsx` |
| Syllabus Tab | Document Management | `app/api/courses/[id]/route.ts`, `components/syllabus-tab.tsx` |
| Assignments Tab | Assignment Management | `app/api/assignments/route.ts`, `components/assignments-tab.tsx` |
| AI Assistant | AI Integration | `app/api/chat/route.ts`, `components/chatbot-tab.tsx` |
| Feedback Analyzer | AI Analysis Engine | `app/api/analyze-assignment/route.ts`, `components/feedback-analysis-dialog.tsx` |
| Student Dashboard | Student Portal | `app/student/page.tsx`, `components/student-dashboard.tsx` |
| Admin Portal | Admin Interface | `app/admin/page.tsx`, `components/admin-portal.tsx` |

---

## ✅ **Core Functionality Checklist**

- ✅ **Landing/Dashboard Page** - Login page with role selection
- ✅ **Role-Based Interfaces** - Faculty, Student, Admin (3 roles)
- ✅ **Working Buttons** - All interactive elements functional
- ✅ **Forms** - Login, course creation, assignment creation
- ✅ **Data Entry** - Course creation, assignment submission
- ✅ **Data Retrieval** - Course listing, submission viewing
- ✅ **Data Processing** - AI analysis, PDF generation
- ✅ **AI Integration** - Chatbot and feedback analysis
- ✅ **File Upload** - Student submissions
- ✅ **PDF Processing** - Syllabus parsing, annotated PDFs

---

## 🎯 **Key Features Demonstrated**

1. **Multi-Role Authentication** - Three distinct user roles with separate interfaces
2. **Course Management** - Full CRUD operations for courses
3. **AI-Powered Analysis** - Automated feedback generation using Gemini
4. **Context-Aware Chatbot** - Syllabus-aligned AI assistant
5. **File Processing** - PDF parsing and generation
6. **Real-Time Streaming** - Live AI responses
7. **Data Integration** - JSON-based data layer with API routes
8. **Responsive UI** - Modern, accessible interface

---

## 📦 **Data Summary**

| Entity | Count | Location | Used In |
|--------|-------|----------|---------|
| Faculty | 8 | `dataset/faculty/faculty.json` | Login, Admin Portal |
| Courses | 16 | `dataset/courses/courses.json` | Course Dashboard |
| Assignments | 64 | `dataset/assignments/assignments.json` | Assignments Tab |
| Rubrics | 384 | `dataset/rubrics/rubrics.json` | Feedback Analyzer |
| Submissions | 768 | `dataset/submissions/` | Feedback Analyzer |
| Students | 50+ | `dataset/students/students.json` | Student Portal, Name Mapping |
| Syllabi | 16 | `dataset/syllabus/` | Syllabus Tab, AI Context |

---

## 📸 **Screenshots to Include**

For your submission, capture screenshots of:
1. Login page with all three role tabs
2. Faculty course dashboard
3. Course detail view with tabs
4. AI Assistant chat interface
5. Feedback Analyzer results
6. Student dashboard
7. Admin portal

---

**Note:** Replace `https://faculty-portal-mrp.vercel.app` with your actual Vercel deployment URL when you have it.

---

This prototype is fully functional and ready for MVP refinement. All core features are implemented and working as demonstrated.

