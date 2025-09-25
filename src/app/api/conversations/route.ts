import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase-server'

export async function GET() {
  try {
    const supabase = await getSupabaseServer()
    if (!supabase) {
      return NextResponse.json({ conversations: [] })
    }

    // Get user from session
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ conversations: [] })
    }

    // Fetch user's conversations
    const { data: conversations, error } = await supabase
      .from('conversations')
      .select('id, title, created_at, updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Conversations fetch error:', error)
      return NextResponse.json({ conversations: [] })
    }

    return NextResponse.json({ conversations: conversations || [] })
  } catch (error) {
    console.error('Conversations GET error:', error)
    return NextResponse.json({ conversations: [] })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServer()
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    // Get user from session
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const title: string = body?.title || 'New chat'
    
    // Create new conversation in database
    const { data: conversation, error } = await supabase
      .from('conversations')
      .insert({
        user_id: user.id,
        title: title
      } as any)
      .select()
      .single()

    if (error) {
      console.error('Conversation creation error:', error)
      return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 })
    }
    
    return NextResponse.json({ conversation })
  } catch (error) {
    console.error('Conversations POST error:', error)
    return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 })
  }
}
