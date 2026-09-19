import { NextRequest, NextResponse } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!

function sbHeaders(userToken: string) {
  return {
    'apikey': SUPABASE_ANON,
    'Authorization': `Bearer ${userToken}`,
    'Content-Type': 'application/json',
  }
}

function getToken(req: NextRequest): string | null {
  const auth = req.headers.get('authorization') || ''
  const token = auth.replace(/^Bearer\s+/i, '').trim()
  return token || null
}

// GET /api/sync?key=kanban_tasks_v2
export async function GET(req: NextRequest) {
  const token = getToken(req)
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const key = req.nextUrl.searchParams.get('key')
  if (!key) return NextResponse.json({ error: 'key required' }, { status: 400 })

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/user_data?key=eq.${encodeURIComponent(key)}&select=value`,
    { headers: sbHeaders(token), cache: 'no-store' }
  )
  if (res.status === 401) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const rows = await res.json()
  return NextResponse.json({ value: rows?.[0]?.value ?? null })
}

// POST /api/sync  { key, value }
export async function POST(req: NextRequest) {
  const token = getToken(req)
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { key, value } = await req.json()
  if (!key) return NextResponse.json({ error: 'key required' }, { status: 400 })

  const res = await fetch(`${SUPABASE_URL}/rest/v1/user_data`, {
    method: 'POST',
    headers: { ...sbHeaders(token), 'Prefer': 'resolution=merge-duplicates' },
    body: JSON.stringify({ key, value, updated_at: new Date().toISOString() }),
  })

  if (res.status === 401) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!res.ok) {
    const err = await res.text()
    return NextResponse.json({ error: err }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
