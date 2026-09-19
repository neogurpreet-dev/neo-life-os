import { NextRequest, NextResponse } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!

// POST /api/auth/login  { email, password }
export async function POST(req: NextRequest) {
  const { email, password } = await req.json()
  if (!email || !password)
    return NextResponse.json({ error: 'email and password required' }, { status: 400 })

  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_ANON },
    body: JSON.stringify({ email, password }),
  })

  const data = await res.json()
  if (!res.ok)
    return NextResponse.json({ error: data.error_description || data.error || 'Login failed' }, { status: 401 })

  return NextResponse.json({
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_in: data.expires_in,
  })
}
