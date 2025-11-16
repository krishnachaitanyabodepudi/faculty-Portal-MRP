// Database utility functions
// This file will work with Supabase, Neon, or any PostgreSQL database

interface DatabaseConfig {
  connectionString: string
}

// For Supabase
export async function getSupabaseClient() {
  if (typeof window !== 'undefined') {
    // Client-side
    const { createBrowserClient } = await import('@supabase/ssr')
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  } else {
    // Server-side
    const { createClient } = await import('@supabase/supabase-js')
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }
}

// For Neon (if using Neon instead)
export async function getNeonClient() {
  const { neon } = await import('@neondatabase/serverless')
  return neon(process.env.DATABASE_URL!)
}

// Generic query function
export async function query(sql: string, params: any[] = []) {
  try {
    const client = await getSupabaseClient()
    const { data, error } = await client.rpc('exec_sql', { query: sql, params })
    if (error) throw error
    return data
  } catch (error) {
    console.error('Database query error:', error)
    throw error
  }
}
