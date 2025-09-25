import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase-server'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await getSupabaseServer()
    if (!supabase) {
      return NextResponse.json({ messages: [] })
    }

    const conversationId = params.id

    // Fetch messages for this conversation
    const { data: messages, error } = await (supabase as any)
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Messages fetch error:', error)
      return NextResponse.json({ messages: [] })
    }

    return NextResponse.json({ messages: messages || [] })
  } catch (error) {
    console.error('Messages GET error:', error)
    return NextResponse.json({ messages: [] })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await getSupabaseServer()
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    const body = await request.json().catch(() => ({}))
    const { role, content, metadata } = body || {}
    if (!role || !content) return NextResponse.json({ error: 'Missing role or content' }, { status: 400 })

    const conversationId = params.id
    
    // Create new message in database
    const { data: message, error } = await (supabase as any)
      .from('messages')
      .insert({
        conversation_id: conversationId,
        role,
        content,
        metadata: metadata || {}
      })
      .select()
      .single()

    if (error) {
      console.error('Message creation error:', error)
      return NextResponse.json({ error: 'Failed to create message' }, { status: 500 })
    }
    
    return NextResponse.json({ message })
  } catch (error) {
    console.error('Messages POST error:', error)
    return NextResponse.json({ error: 'Failed to create message' }, { status: 500 })
  }
}
