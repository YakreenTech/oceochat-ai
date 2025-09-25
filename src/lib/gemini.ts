import { GoogleGenerativeAI } from '@google/generative-ai'

type GeminiModel = 'gemini-1.5-flash' | 'gemini-1.5-flash-8b' | 'gemini-1.5-pro' | 'gemini-pro'

export class GeminiService {
  private client?: GoogleGenerativeAI
  private availableModel?: GeminiModel
  private modelHierarchy: GeminiModel[] = [
    'gemini-1.5-flash',
    'gemini-1.5-flash-8b', 
    'gemini-1.5-pro',
    'gemini-pro'
  ]

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY
    if (apiKey) {
      this.client = new GoogleGenerativeAI(apiKey)
      this.detectAvailableModel()
    }
  }

  private async detectAvailableModel() {
    if (!this.client) return
    
    // Try models in order of preference (free tier first)
    for (const modelName of this.modelHierarchy) {
      try {
        const model = this.client.getGenerativeModel({ model: modelName })
        await model.generateContent('test')
        this.availableModel = modelName
        console.log(`OceoChat: Using Gemini model ${modelName}`)
        break
      } catch (error) {
        console.log(`Model ${modelName} not available, trying next...`)
        continue
      }
    }
    
    if (!this.availableModel) {
      console.warn('No Gemini models available with current API key')
    }
  }

  get isConfigured() {
    return !!this.client && !!this.availableModel
  }

  async generateResponse(prompt: string, context?: Record<string, any>): Promise<string> {
    try {
      if (!this.client || !this.availableModel) {
        return `OceoChat is not properly configured. Please check your GEMINI_API_KEY and try again.\n\nYour query: "${prompt}"`
      }

      const model = this.client.getGenerativeModel({ model: this.availableModel })
      const fullPrompt = this.buildOceanographyPrompt(prompt, context)

      const result = await model.generateContent(fullPrompt)
      const response = await result.response
      const text = response.text()
      
      if (!text || !text.trim()) {
        return 'I could not generate a response for that oceanographic query. Please try rephrasing your question.'
      }
      
      return text
    } catch (error: any) {
      console.error('Gemini error:', error?.message || error)
      
      // Try fallback model if current one fails
      if (this.availableModel && error?.message?.includes('quota') || error?.message?.includes('limit')) {
        return 'The AI service has reached its usage limit. Please try again later or upgrade your API plan.'
      }
      
      return 'I encountered an error processing your oceanographic query. Please try again or contact support if the issue persists.'
    }
  }

  private buildOceanographyPrompt(prompt: string, context?: Record<string, any>): string {
    let systemPrompt = `You are OceoChat, an expert oceanographic research assistant with deep knowledge of marine science. You help marine scientists, researchers, educators, and students analyze ocean data from multiple authoritative sources.

CORE EXPERTISE:
- Physical Oceanography: Temperature, salinity, density, currents, waves, tides
- Chemical Oceanography: Nutrients, oxygen, pH, carbon cycle, pollutants
- Biological Oceanography: Marine ecosystems, primary productivity, fisheries
- Ocean-Climate Interactions: ENSO, monsoons, climate change impacts
- Marine Data Analysis: Statistical methods, trend analysis, quality control

DATA SOURCES YOU WORK WITH:
- ARGO Float Network: 3,000+ autonomous floats providing temperature/salinity profiles
- NOAA Ocean Service: Tides, currents, sea level, marine weather
- NASA Ocean Color: Satellite chlorophyll, sea surface temperature, ocean productivity
- Marine Copernicus: European marine forecasts and reanalysis
- INCOIS: Indian Ocean specialized observations

RESPONSE GUIDELINES:
1. Provide scientifically accurate, research-grade responses
2. Include relevant oceanographic context and terminology
3. Suggest appropriate data visualizations when helpful
4. Offer research methodology recommendations
5. Highlight data limitations and uncertainties
6. Provide proper citations for data sources
7. Generate testable research hypotheses when appropriate

USER QUERY: ${prompt}`

    if (context?.oceanData) {
      systemPrompt += `\n\nAVAILABLE OCEAN DATA:\n${JSON.stringify(context.oceanData, null, 2)}`
      systemPrompt += `\n\nDATA ANALYSIS INSTRUCTIONS:
- Identify significant patterns, trends, or anomalies in the provided data
- Provide statistical context (means, ranges, confidence intervals where applicable)
- Suggest appropriate visualizations (time series, 3D profiles, spatial maps)
- Recommend follow-up research questions or additional data sources
- Include data quality assessment and limitations
- Explain oceanographic processes that might explain observed patterns`
    }

    if (context?.conversationHistory) {
      systemPrompt += `\n\nCONVERSATION CONTEXT: This is part of an ongoing research discussion. Build upon previous exchanges while maintaining scientific rigor.`
    }

    return systemPrompt
  }
}

export const geminiService = new GeminiService()
