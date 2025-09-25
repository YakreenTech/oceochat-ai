import { NextResponse } from 'next/server'
import { getModelSelector } from '@/lib/gemini-model-selector'

export async function GET() {
  try {
    // Check if GEMINI_API_KEY is set
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ 
        error: 'GEMINI_API_KEY environment variable is not set',
        status: 'missing_api_key'
      }, { status: 500 })
    }

    // Test model selector
    const modelSelector = getModelSelector()
    if (!modelSelector) {
      return NextResponse.json({ 
        error: 'Model selector initialization failed',
        status: 'selector_failed'
      }, { status: 500 })
    }

    // Test getting the best model
    const { modelName } = await modelSelector.getBestModel()
    
    return NextResponse.json({ 
      status: 'success',
      message: 'API is working correctly',
      currentModel: modelName,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Test API error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 'test_failed',
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    }, { status: 500 })
  }
}
