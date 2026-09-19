import { NextRequest, NextResponse } from 'next/server'

const SUPABASE_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!

export async function POST(req: NextRequest) {
  const { email, token, type = 'signup' } = await req.json() as {
    email?: string
    token?: string
    type?: string
  }

  if (!email || !token) {
    return NextResponse.json({ error: 'Email and verification code are required' }, { status: 400 })
  }

  const res = await fetch(`${SUPABASE_URL}/auth/v1/verify`, {
    method: 'POST',
    headers: { 'apikey': SUPABASE_ANON, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, token, type }),
  })

  const data = await res.json()

  if (!res.ok) {
    return NextResponse.json(
      { error: data.message || data.error_description || 'Verification failed — check your code and try again' },
      { status: res.status }
    )
  }

  return NextResponse.json({
    access_token:  data.access_token,
    refresh_token: data.refresh_token,
    expires_in:    data.expires_in,
  })
}
