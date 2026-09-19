import { NextRequest, NextResponse } from 'next/server'

const SUPABASE_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!

export async function POST(req: NextRequest) {
  const body = await req.json() as {
    email?: string
    password?: string
    display_name?: string
    resend?: boolean
  }

  const { email, password, display_name, resend } = body

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 })
  }

  // Build the callback URL from the incoming request origin
  const origin = req.headers.get('origin') || req.nextUrl.origin
  const redirectTo = `${origin}/auth/callback`

  // Resend confirmation email (magic link)
  if (resend) {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/resend`, {
      method: 'POST',
      headers: { 'apikey': SUPABASE_ANON, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, type: 'signup', options: { emailRedirectTo: redirectTo } }),
    })
    if (!res.ok) {
      const data = await res.json()
      return NextResponse.json({ error: data.message || 'Resend failed' }, { status: res.status })
    }
    return NextResponse.json({ message: 'Email resent' })
  }

  // New sign-up
  if (!password) {
    return NextResponse.json({ error: 'Password is required' }, { status: 400 })
  }

  const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
    method: 'POST',
    headers: { 'apikey': SUPABASE_ANON, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password,
      data: { display_name: display_name || '' },
      options: { emailRedirectTo: redirectTo },
    }),
  })

  const data = await res.json()

  if (!res.ok) {
    return NextResponse.json(
      { error: data.message || data.error_description || 'Sign-up failed' },
      { status: res.status }
    )
  }

  // confirmed = true means email confirmation is disabled and user is immediately active
  const confirmed = !!(data.access_token)
  return NextResponse.json({
    message: confirmed ? 'Account created' : 'Check your email for a confirmation link',
    confirmed,
    ...(confirmed ? {
      access_token:  data.access_token,
      refresh_token: data.refresh_token,
      expires_in:    data.expires_in,
    } : {}),
  })
}
