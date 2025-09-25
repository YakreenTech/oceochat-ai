import { NextResponse } from 'next/server'
import { ChatNamingService } from '@/services/chat-naming-service'
import { getEnhancedAIEngine } from '@/services/enhanced-ai-engine'

export async function GET() {
  try {
    // Test that imports work correctly
    const aiEngine = getEnhancedAIEngine()
    const validation = ChatNamingService.validateChatName('Test Chat')
    
    return NextResponse.json({
      success: true,
      aiEngineAvailable: !!aiEngine,
      validationWorks: validation.isValid,
      message: 'Build test successful - all imports working'
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Build test failed'
    }, { status: 500 })
  }
}
