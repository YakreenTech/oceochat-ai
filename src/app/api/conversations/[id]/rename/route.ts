import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase-server'
import { ChatNamingService } from '@/services/chat-naming-service'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await getSupabaseServer()
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { newName } = await request.json()
    
    // Validate the new name
    const validation = ChatNamingService.validateChatName(newName)
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    // Update the chat name
    const success = await ChatNamingService.updateChatName(params.id, newName, user.id)
    
    if (!success) {
      return NextResponse.json({ error: 'Failed to update chat name' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Chat name updated successfully',
      newName: newName.trim()
    })

  } catch (error) {
    console.error('Rename conversation error:', error)
    return NextResponse.json(
      { error: 'Failed to rename conversation' }, 
      { status: 500 }
    )
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

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user owns this conversation
    const { data: conversation } = await supabase
      .from('conversations')
      .select('user_id')
      .eq('id', params.id)
      .single()

    if (!conversation || conversation.user_id !== user.id) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    // Auto-generate name
    const generatedName = await ChatNamingService.autoGenerateChatName(params.id)
    
    if (!generatedName) {
      return NextResponse.json({ error: 'Failed to generate chat name' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      generatedName,
      message: 'Chat name generated successfully'
    })

  } catch (error) {
    console.error('Auto-generate name error:', error)
    return NextResponse.json(
      { error: 'Failed to generate chat name' }, 
      { status: 500 }
    )
  }
}
