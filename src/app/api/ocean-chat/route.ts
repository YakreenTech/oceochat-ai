import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase-server'
import { oceanIntelligence } from '@/services/ocean-intelligence'
import { getEnhancedAIEngine } from '@/services/enhanced-ai-engine'
import { ChatNamingService } from '@/services/chat-naming-service'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServer()
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { message, conversationId, streamResponse = false } = await request.json()
    
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }
    
    // Get conversation context
    const { data: messages } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(10)
    
    const context = {
      history: messages || [],
      user: user,
      conversationId
    }
    
    if (streamResponse) {
      // Enhanced streaming response with AI engine
      return new Response(
        new ReadableStream({
          async start(controller) {
            try {
              const enhancedAI = getEnhancedAIEngine()
              
              if (enhancedAI) {
                // Use enhanced AI engine for streaming
                const oceanData = await oceanIntelligence.gatherOceanData({
                  requiresARGO: message.toLowerCase().includes('argo') || message.toLowerCase().includes('temperature'),
                  requiresNOAA: message.toLowerCase().includes('tide') || message.toLowerCase().includes('current'),
                  requiresNASA: message.toLowerCase().includes('satellite') || message.toLowerCase().includes('chlorophyll'),
                  location: { lat: 19.0760, lon: 72.8777, radius: 150 },
                  timeRange: {
                    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    end: new Date().toISOString().split('T')[0]
                  },
                  parameters: [],
                  analysisType: 'description'
                })
                
                const streamGenerator = enhancedAI.streamEnhancedResponse(message, oceanData, context.history)
                
                for await (const chunk of streamGenerator) {
                  const data = JSON.stringify({
                    content: chunk.chunk,
                    isComplete: chunk.isComplete,
                    metadata: chunk.metadata
                  })
                  
                  controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`))
                }
              } else {
                // Fallback to regular ocean intelligence
                const result = await oceanIntelligence.processIntelligentQuery(message, context)
                
                const words = result.response.split(' ')
                const chunkSize = 5
                
                for (let i = 0; i < words.length; i += chunkSize) {
                  const chunk = words.slice(i, i + chunkSize).join(' ')
                  const data = JSON.stringify({ 
                    content: chunk + ' ',
                    isComplete: false
                  })
                  
                  controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`))
                  await new Promise(resolve => setTimeout(resolve, 50))
                }
                
                controller.enqueue(
                  new TextEncoder().encode(`data: ${JSON.stringify({ 
                    content: '',
                    isComplete: true,
                    confidence: result.confidence,
                    followUp: result.followUp,
                    sources: result.sources
                  })}\n\n`)
                )
              }
              
              controller.close()
            } catch (error) {
              console.error('Streaming error:', error)
              controller.enqueue(
                new TextEncoder().encode(`data: ${JSON.stringify({ 
                  error: 'Failed to process query',
                  isComplete: true 
                })}\n\n`)
              )
              controller.close()
            }
          }
        }),
        {
          headers: {
            'Content-Type': 'text/plain',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
          },
        }
      )
    }
    
    // Regular response
    const result = await oceanIntelligence.processIntelligentQuery(message, context)
    
    // Save user message
    await supabase.from('messages').insert({
      conversation_id: conversationId, 
      role: 'user', 
      content: message,
      user_id: user.id
    })

    // Save assistant message
    await supabase.from('messages').insert({
      conversation_id: conversationId, 
      role: 'assistant', 
      content: result.response,
      user_id: user.id,
      metadata: {
        data: result.data,
        visualizations: result.visualizations,
        confidence: result.confidence,
        sources: result.sources,
        methodology: result.methodology
      }
    })

    // Auto-generate chat name if needed (async, don't wait)
    ChatNamingService.checkAndAutoName(conversationId).catch(error => {
      console.error('Auto-naming error:', error)
    })
    
    return NextResponse.json({
      response: result.response,
      data: result.data,
      visualizations: result.visualizations,
      confidence: result.confidence,
      followUp: result.followUp,
      sources: result.sources,
      methodology: result.methodology,
      success: true
    })
    
  } catch (error) {
    console.error('Ocean chat API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to process ocean query', 
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    )
  }
}
