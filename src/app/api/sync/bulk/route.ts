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

// POST /api/sync/bulk  { keys: string[] }
export async function POST(req: NextRequest) {
  const token = getToken(req)
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { keys } = await req.json() as { keys: string[] }
  if (!keys?.length) return NextResponse.json({ items: [] })

  const keyList = keys.map(k => `"${k}"`).join(',')
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/user_data?key=in.(${encodeURIComponent(keyList)})&select=key,value`,
    { headers: sbHeaders(token), cache: 'no-store' }
  )

  if (res.status === 401) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const rows: { key: string; value: unknown }[] = await res.json()

  const map = Object.fromEntries((rows || []).map(r => [r.key, r.value]))
  const items = keys.map(k => ({ key: k, value: map[k] ?? null }))
  return NextResponse.json({ items })
}
