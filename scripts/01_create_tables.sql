-- Silverleaf University Faculty Portal Database Schema

-- Users/Professors table
CREATE TABLE IF NOT EXISTS professors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  department VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professor_id UUID REFERENCES professors(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) NOT NULL,
  duration VARCHAR(100),
  syllabus_content TEXT,
  syllabus_file_url TEXT,
  timetable_file_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Assignments table
CREATE TABLE IF NOT EXISTS assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  due_date DATE,
  total_points INTEGER DEFAULT 100,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Student submissions table
CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
  student_name VARCHAR(255) NOT NULL,
  student_id VARCHAR(50) NOT NULL,
  file_url TEXT NOT NULL,
  submitted_date TIMESTAMP DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'submitted',
  score INTEGER,
  feedback TEXT,
  graded_at TIMESTAMP
);

-- Chat history table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert default professor
INSERT INTO professors (email, password_hash, full_name, department) 
VALUES ('professor@silverleaf.edu', 'password123', 'Dr. Sarah Johnson', 'Computer Science')
ON CONFLICT (email) DO NOTHING;
