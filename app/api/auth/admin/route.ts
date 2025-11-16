import { NextResponse } from 'next/server'
import { createHash } from 'crypto'

// Admin credentials (in production, store in environment variables or database)
const ADMIN_CREDENTIALS = {
  email: 'admin@university.edu',
  password: 'admin123' // In production, use hashed password
}

function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex')
}

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    
    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email and password are required' }, { status: 400 })
    }
    
    // Check admin credentials
    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
      return NextResponse.json({
        success: true,
        user: {
          id: 'admin',
          email: ADMIN_CREDENTIALS.email,
          name: 'Administrator',
          role: 'admin'
        }
      })
    }
    
    return NextResponse.json({ success: false, error: 'Invalid admin credentials' }, { status: 401 })
  } catch (error) {
    console.error('Admin login error:', error)
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 })
  }
}






