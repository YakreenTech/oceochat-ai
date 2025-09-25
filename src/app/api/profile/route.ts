import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase-server'
import type { Database } from '@/lib/supabase-types'

export async function GET() {
  const supabase = getSupabaseServer()
  if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })

  const { data: { user }, error: userErr } = await supabase.auth.getUser()
  if (userErr) return NextResponse.json({ error: userErr.message }, { status: 500 })
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .match({ id: user.id as string })
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ profile: data })
}

export async function PATCH(request: NextRequest) {
  const supabase = getSupabaseServer()
  if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })

  const { data: { user }, error: userErr } = await supabase.auth.getUser()
  if (userErr) return NextResponse.json({ error: userErr.message }, { status: 500 })
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const updates: Database['public']['Tables']['users']['Update'] = {
    full_name: body?.full_name,
    institution: body?.institution,
    research_area: body?.research_area,
    expertise_level: body?.expertise_level,
    // Optional preferences passthrough when provided
    preferences: body?.preferences,
  }

  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .match({ id: user.id as string })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ profile: data })
}
