import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase-server'
import type { Database } from '@/lib/supabase-types'

// POST /api/export
// Body: { conversationId: string, format: 'json' | 'csv' }
// Returns: { export: research_exports row, content: string, filename: string, mime: string }
export async function POST(request: NextRequest) {
  const supabase = getSupabaseServer()
  if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const conversationId: string | undefined = body?.conversationId
  const format: 'json' | 'csv' = (body?.format === 'csv' ? 'csv' : 'json')
  if (!conversationId) return NextResponse.json({ error: 'Missing conversationId' }, { status: 400 })

  // Fetch conversation (RLS enforces ownership)
  const { data: convo, error: convoErr } = await supabase
    .from('conversations')
    .select('*')
    .match({ id: conversationId })
    .single()
  if (convoErr || !convo) return NextResponse.json({ error: convoErr?.message || 'Conversation not found' }, { status: 404 })

  // Fetch messages
  const { data: messages, error: msgErr } = await supabase
    .from('messages')
    .select('*')
    .match({ conversation_id: conversationId })
    .order('created_at', { ascending: true })
  if (msgErr) return NextResponse.json({ error: msgErr.message }, { status: 500 })

  // Derive data sources from metadata.oceanData keys if present
  const msgRows: Database['public']['Tables']['messages']['Row'][] = Array.isArray(messages) ? (messages as any) : []
  const dataSources = Array.from(new Set(msgRows.flatMap((m) => {
    const od = (m.ocean_data as Record<string, unknown> | null)
    if (!od) return []
    try { return Object.keys(od) } catch { return [] }
  })))

  let content = ''
  const filename = `oceochat_export_${conversationId}.${format}`
  const mime = format === 'csv' ? 'text/csv' : 'application/json'

  if (format === 'json') {
    content = JSON.stringify({ conversation: convo, messages: msgRows }, null, 2)
  } else {
    // Simple CSV: created_at, role, content (quote and escape)
    const csvRows = [
      ['created_at', 'role', 'content'],
      ...msgRows.map((m) => [m.created_at, m.role, (m.content || '').replaceAll('"', '""')])
    ]
    content = csvRows.map(r => r.map(v => `"${String(v ?? '')}"`).join(',')).join('\n')
  }

  // Insert research_export row as completed (no file storage for now)
  const { data: exp, error: expErr } = await supabase
    .from('research_exports')
    .insert({
      user_id: user.id as any,
      conversation_id: conversationId as any,
      export_type: format as any,
      data_sources: dataSources as any,
      status: 'completed' as any,
      metadata: { generated_at: new Date().toISOString(), item_count: msgRows.length } as any,
    } as any)
    .select()
    .single()

  if (expErr) return NextResponse.json({ error: expErr.message }, { status: 500 })

  return NextResponse.json({ export: exp, content, filename, mime })
}
