import { NextRequest, NextResponse } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!

// POST /api/auth/refresh  { refresh_token }
export async function POST(req: NextRequest) {
  const { refresh_token } = await req.json()
  if (!refresh_token)
    return NextResponse.json({ error: 'refresh_token required' }, { status: 400 })

  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_ANON },
    body: JSON.stringify({ refresh_token }),
  })

  const data = await res.json()
  if (!res.ok)
    return NextResponse.json({ error: 'Token refresh failed' }, { status: 401 })

  return NextResponse.json({
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_in: data.expires_in,
  })
}
