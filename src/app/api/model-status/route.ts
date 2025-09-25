import { NextResponse } from 'next/server'
import { getModelSelector } from '@/lib/gemini-model-selector'

export async function GET() {
  try {
    const modelSelector = getModelSelector()
    
    if (!modelSelector) {
      return NextResponse.json({ 
        error: 'GEMINI_API_KEY not configured',
        currentModel: 'Not available',
        availableModels: []
      }, { status: 500 })
    }

    // Get current best model and all model status
    const [currentModelName, modelStatus] = await Promise.all([
      modelSelector.getCurrentModelName(),
      modelSelector.getModelStatus()
    ])

    return NextResponse.json({
      currentModel: currentModelName,
      availableModels: modelStatus,
      lastUpdated: new Date().toISOString()
    })
  } catch (error) {
    console.error('Model status error:', error)
    return NextResponse.json({ 
      error: 'Failed to get model status',
      currentModel: 'Unknown',
      availableModels: []
    }, { status: 500 })
  }
}
