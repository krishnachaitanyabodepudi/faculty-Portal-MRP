# Database Overview

## Current Database Structure

The system uses JSON files stored in the `dataset/` directory as the database. Here's what data exists:

---

## 📊 **Data Summary**

| Entity | Count | Location |
|--------|-------|----------|
| **Faculty Members** | 8 | `dataset/faculty/faculty.json` |
| **Courses** | 16 | `dataset/courses/courses.json` |
| **Assignments** | 64 | `dataset/assignments/assignments.json` |
| **Rubrics** | 384 | `dataset/rubrics/rubrics.json` |
| **Student Submissions** | 768 | `dataset/submissions/` (12 per assignment) |
| **Syllabi** | 16 | `dataset/syllabus/` (one per course) |

---

## 👥 **1. Faculty Data** (8 records)

**File:** `dataset/faculty/faculty.json`

**Fields:**
- `faculty_id` (F101-F108)
- `name`
- `email`
- `department` (Computer Science, Mathematics, Physics, Chemistry)
- `designation` (Professor, Associate Professor, Assistant Professor)
- `bio`
- `research_areas` (array)
- `office_hours`
- `password_hash`

**Faculty List:**
1. **F101** - Dr. Sarah Mitchell (Computer Science, Professor)
2. **F102** - Dr. James Anderson (Computer Science, Associate Professor)
3. **F103** - Dr. Emily Chen (Mathematics, Professor)
4. **F104** - Dr. Michael Rodriguez (Mathematics, Associate Professor)
5. **F105** - Dr. Lisa Thompson (Physics, Professor)
6. **F106** - Dr. Robert Kim (Physics, Assistant Professor)
7. **F107** - Dr. Patricia Williams (Chemistry, Professor)
8. **F108** - Dr. David Lee (Chemistry, Associate Professor)

---

## 📚 **2. Courses Data** (16 records)

**File:** `dataset/courses/courses.json`

**Fields:**
- `course_id` (C101-C116)
- `faculty_id` (F101-F108) - Links to faculty
- `name`
- `code`
- `description`
- `strength` (number of students)
- `syllabus_file` (path to PDF)
- `timeline_file` (path to timeline PDF)
- `duration` (e.g., "12 weeks")

**Course Distribution:**
- Each faculty member teaches **2 courses**
- **F101**: C101, C102
- **F102**: C103, C104
- **F103**: C105, C106
- **F104**: C107, C108
- **F105**: C109, C110
- **F106**: C111, C112
- **F107**: C113, C114
- **F108**: C115, C116

---

## 📝 **3. Assignments Data** (64 records)

**File:** `dataset/assignments/assignments.json`

**Fields:**
- `assignment_id` (e.g., C101_A01)
- `course_id` (C101-C116) - Links to course
- `title`
- `description` (detailed multi-paragraph)
- `deliverables` (array)
- `submission_instructions`
- `formatting_requirements`
- `due_date`
- `max_score` (100)
- `weight` (percentage)

**Structure:**
- **4 assignments per course**
- Assignment IDs: `{course_id}_A01`, `{course_id}_A02`, `{course_id}_A03`, `{course_id}_A04`
- Example: C101_A01, C101_A02, C101_A03, C101_A04

---

## 📋 **4. Rubrics Data** (384 records)

**File:** `dataset/rubrics/rubrics.json`

**Fields:**
- `rubric_id` (e.g., C101_A01_R01)
- `assignment_id` (links to assignment)
- `criterion_name`
- `weight` (percentage)
- `description`
- `indicators` (array of 4 quality levels)

**Structure:**
- **6 rubric criteria per assignment** (on average)
- Each criterion has 4 quality indicators: Excellent, Good, Satisfactory, Needs Improvement
- Total: 64 assignments × 6 criteria = 384 rubrics

---

## 📄 **5. Student Submissions** (768 files)

**Location:** `dataset/submissions/{course_id}/{assignment_id}/`

**Structure:**
- **12 submissions per assignment**
- Each submission has:
  - `sub01.txt` through `sub12.txt` (text format)
  - `sub01.pdf` through `sub12.pdf` (PDF format)
- Total: 64 assignments × 12 submissions = **768 submissions**

**File Naming:**
```
dataset/submissions/
  ├── C101/
  │   ├── C101_A01/
  │   │   ├── sub01.txt
  │   │   ├── sub01.pdf
  │   │   ├── sub02.txt
  │   │   ├── sub02.pdf
  │   │   └── ... (12 submissions)
  │   ├── C101_A02/
  │   └── ...
  └── ...
```

**Content:**
- Submissions are in **APA format**
- Include title pages, references, in-text citations
- Vary in quality (excellent, good, satisfactory, needs improvement)
- Word count: 600-1500 words

---

## 📖 **6. Syllabi Data** (16 files)

**Location:** `dataset/syllabus/{course_id}/`

**Files per course:**
- `syllabus.json` - Structured JSON format
- `syllabus.txt` - Plain text format
- `syllabus.pdf` - PDF format

**Content includes:**
- Course overview
- Learning outcomes
- Required materials
- Assessment breakdown
- Academic policies
- Week-by-week topics (Week 1-12)

---

## 🔗 **Data Relationships**

```
Faculty (8)
  └── Courses (16) - 2 per faculty
      ├── Syllabus (16) - 1 per course
      └── Assignments (64) - 4 per course
          ├── Rubrics (384) - ~6 per assignment
          └── Submissions (768) - 12 per assignment
```

---

## 📁 **File Structure**

```
dataset/
├── faculty/
│   ├── faculty.json
│   └── faculty.sql
├── courses/
│   ├── courses.json
│   └── courses.sql
├── assignments/
│   ├── assignments.json
│   ├── assignments.sql
│   └── {course_id}/
│       └── assignments.json
├── rubrics/
│   ├── rubrics.json
│   └── rubrics.sql
├── submissions/
│   └── {course_id}/
│       └── {assignment_id}/
│           ├── sub01.txt, sub01.pdf
│           ├── sub02.txt, sub02.pdf
│           └── ... (12 submissions)
└── syllabus/
    └── {course_id}/
        ├── syllabus.json
        ├── syllabus.txt
        └── syllabus.pdf
```

---

## 🔐 **Authentication Data**

**Faculty Passwords:**
- Format: `faculty{number}` (e.g., `faculty101`, `faculty102`)
- Stored as SHA256 hashes in `password_hash` field

**Admin Credentials:**
- Email: `admin@university.edu`
- Password: `admin123`
- Stored in: `app/api/auth/admin/route.ts`

---

## 📈 **Statistics**

- **Total Faculty:** 8
- **Total Courses:** 16
- **Total Assignments:** 64
- **Total Rubrics:** 384
- **Total Submissions:** 768
- **Total Syllabi:** 16
- **Average Students per Course:** ~45
- **Submissions per Assignment:** 12

---

## 🎯 **What Would You Like to Change?**

You mentioned wanting to make changes to the database. What specific changes would you like to make?

- Add/remove faculty?
- Modify course structure?
- Change assignment format?
- Update rubric criteria?
- Modify submission data?
- Add new fields to existing entities?






