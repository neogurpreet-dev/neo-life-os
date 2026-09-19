import { NextRequest, NextResponse } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!

const sbHeaders = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
}

// POST /api/sync/bulk  { keys: string[] }
// Returns { items: [{ key, value }] }
export async function POST(req: NextRequest) {
  const { keys } = await req.json() as { keys: string[] }
  if (!keys?.length) return NextResponse.json({ items: [] })

  // Fetch all matching rows in one query
  const keyList = keys.map(k => `"${k}"`).join(',')
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/user_data?key=in.(${encodeURIComponent(keyList)})&select=key,value`,
    { headers: sbHeaders, cache: 'no-store' }
  )
  const rows: { key: string; value: unknown }[] = await res.json()

  // Build a map and return all requested keys (null for missing)
  const map = Object.fromEntries((rows || []).map(r => [r.key, r.value]))
  const items = keys.map(k => ({ key: k, value: map[k] ?? null }))

  return NextResponse.json({ items })
}
