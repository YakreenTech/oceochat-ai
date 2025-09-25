import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai'

export interface ModelInfo {
  name: string
  displayName: string
  isAvailable: boolean
  capabilities: string[]
}

export class GeminiModelSelector {
  private genAI: GoogleGenerativeAI
  private availableModels: ModelInfo[] = []
  private lastChecked: number = 0
  private checkInterval = 5 * 60 * 1000 // 5 minutes

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey)
  }

  /**
   * Get the best available model for research tasks
   * Priority: gemini-1.5-pro > gemini-1.5-flash > gemini-pro (legacy)
   */
  async getBestModel(): Promise<{ model: GenerativeModel; modelName: string }> {
    const modelPriority = [
      'gemini-1.5-pro',
      'gemini-1.5-flash', 
      'gemini-pro'
    ]

    for (const modelName of modelPriority) {
      try {
        const model = this.genAI.getGenerativeModel({ model: modelName })
        
        // Test if model is available with a simple request
        await this.testModel(model, modelName)
        
        console.log(`✅ Using Gemini model: ${modelName}`)
        return { model, modelName }
      } catch (error) {
        console.log(`❌ Model ${modelName} not available:`, (error as Error).message)
        continue
      }
    }

    // Fallback to flash if all else fails
    const fallbackModel = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    console.log(`⚠️ Using fallback model: gemini-1.5-flash`)
    return { model: fallbackModel, modelName: 'gemini-1.5-flash' }
  }

  /**
   * Test if a model is working by making a simple request
   */
  private async testModel(model: GenerativeModel, modelName: string): Promise<void> {
    try {
      const result = await model.generateContent('Test')
      const response = result.response.text()
      if (!response) {
        throw new Error('Empty response from model')
      }
    } catch (error) {
      throw new Error(`Model ${modelName} test failed: ${(error as Error).message}`)
    }
  }

  /**
   * Get model capabilities and status
   */
  async getModelStatus(): Promise<ModelInfo[]> {
    const now = Date.now()
    
    // Cache model status for 5 minutes
    if (this.availableModels.length > 0 && (now - this.lastChecked) < this.checkInterval) {
      return this.availableModels
    }

    const models = [
      {
        name: 'gemini-1.5-pro',
        displayName: 'Gemini 1.5 Pro',
        capabilities: ['Advanced reasoning', 'Long context', 'Research analysis']
      },
      {
        name: 'gemini-1.5-flash',
        displayName: 'Gemini 1.5 Flash', 
        capabilities: ['Fast responses', 'Efficient processing', 'Real-time chat']
      },
      {
        name: 'gemini-pro',
        displayName: 'Gemini Pro (Legacy)',
        capabilities: ['Basic reasoning', 'Standard responses']
      }
    ]

    this.availableModels = await Promise.all(
      models.map(async (modelInfo) => {
        try {
          const model = this.genAI.getGenerativeModel({ model: modelInfo.name })
          await this.testModel(model, modelInfo.name)
          return { ...modelInfo, isAvailable: true }
        } catch {
          return { ...modelInfo, isAvailable: false }
        }
      })
    )

    this.lastChecked = now
    return this.availableModels
  }

  /**
   * Get the current best model name for display purposes
   */
  async getCurrentModelName(): Promise<string> {
    const { modelName } = await this.getBestModel()
    const modelMap: Record<string, string> = {
      'gemini-1.5-pro': 'Gemini 1.5 Pro',
      'gemini-1.5-flash': 'Gemini 1.5 Flash',
      'gemini-pro': 'Gemini Pro'
    }
    return modelMap[modelName] || modelName
  }
}

// Singleton instance
let modelSelector: GeminiModelSelector | null = null

export function getModelSelector(): GeminiModelSelector | null {
  if (!process.env.GEMINI_API_KEY) {
    return null
  }
  
  if (!modelSelector) {
    modelSelector = new GeminiModelSelector(process.env.GEMINI_API_KEY)
  }
  
  return modelSelector
}
