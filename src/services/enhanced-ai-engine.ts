// Enhanced AI Engine with Chat Naming and Performance Optimizations
import { GoogleGenerativeAI } from '@google/generative-ai'
import { ResponseFormatter } from './response-formatter'

export interface ChatNamingResult {
  suggestedName: string
  confidence: number
  category: 'research' | 'analysis' | 'data' | 'general'
}

export interface EnhancedAIResponse {
  content: string
  confidence: number
  processingTime: number
  suggestedName?: string
  followUpQuestions: string[]
  dataInsights: string[]
  visualizationSuggestions: string[]
}

export class EnhancedAIEngine {
  private genAI: GoogleGenerativeAI
  private model: any
  private fastModel: any
  private cache: Map<string, any> = new Map()

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey)
    
    // Primary model for complex analysis
    this.model = this.genAI.getGenerativeModel({ 
      model: "gemini-1.5-pro",
      generationConfig: {
        temperature: 0.3,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 8192,
      }
    })
    
    // Fast model for quick responses and naming
    this.fastModel = this.genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.2,
        topP: 0.7,
        topK: 30,
        maxOutputTokens: 2048,
      }
    })
  }

  // Generate chat name based on conversation content
  async generateChatName(messages: Array<{role: string, content: string}>): Promise<ChatNamingResult> {
    const startTime = Date.now()
    
    try {
      // Create context from first few messages
      const context = messages.slice(0, 3).map(msg => 
        `${msg.role}: ${msg.content.substring(0, 200)}`
      ).join('\n')
      
      const namingPrompt = `Based on this oceanographic research conversation, generate a concise, descriptive title (3-6 words):

${context}

Requirements:
- Focus on the main oceanographic topic or research question
- Use scientific terminology when appropriate
- Make it specific and informative
- Examples: "ARGO Float Temperature Analysis", "Mumbai Coastal Current Study", "Bay of Bengal Salinity Trends"

Respond with just the title, no explanation.`

      const result = await this.fastModel.generateContent(namingPrompt)
      const suggestedName = result.response.text().trim().replace(/['"]/g, '')
      
      // Determine category based on content
      const category = this.categorizeConversation(context)
      
      const processingTime = Date.now() - startTime
      const confidence = this.calculateNamingConfidence(suggestedName, context)
      
      return {
        suggestedName,
        confidence,
        category
      }
    } catch (error) {
      console.error('Chat naming error:', error)
      return {
        suggestedName: `Ocean Research Chat ${new Date().toLocaleDateString()}`,
        confidence: 0.5,
        category: 'general'
      }
    }
  }

  // Enhanced ocean research response generation
  async generateEnhancedResponse(
    query: string, 
    oceanData?: any, 
    conversationHistory?: Array<{role: string, content: string}>
  ): Promise<EnhancedAIResponse> {
    const startTime = Date.now()
    
    try {
      // Check cache first for performance
      const cacheKey = this.generateCacheKey(query, oceanData)
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey)
        return { ...cached, processingTime: Date.now() - startTime }
      }

      const enhancedPrompt = this.buildEnhancedPrompt(query, oceanData, conversationHistory)
      
      // Use appropriate model based on query complexity
      const model = this.shouldUseFastModel(query) ? this.fastModel : this.model
      
      const result = await model.generateContent(enhancedPrompt)
      const content = result.response.text()
      
      // Extract insights and suggestions
      const dataInsights = this.extractDataInsights(content, oceanData)
      const visualizationSuggestions = this.extractVisualizationSuggestions(content)
      const followUpQuestions = this.generateFollowUpQuestions(query, content)
      
      const response: EnhancedAIResponse = {
        content,
        confidence: this.calculateResponseConfidence(content, oceanData),
        processingTime: Date.now() - startTime,
        followUpQuestions,
        dataInsights,
        visualizationSuggestions
      }

      // Cache successful responses
      this.cache.set(cacheKey, response)
      
      return response
    } catch (error) {
      console.error('Enhanced AI response error:', error)
      throw error
    }
  }

  // Stream enhanced responses for real-time chat
  async *streamEnhancedResponse(
    query: string, 
    oceanData?: any, 
    conversationHistory?: Array<{role: string, content: string}>
  ): AsyncGenerator<{chunk: string, isComplete: boolean, metadata?: any}> {
    try {
      const enhancedPrompt = this.buildEnhancedPrompt(query, oceanData, conversationHistory)
      const model = this.shouldUseFastModel(query) ? this.fastModel : this.model
      
      const result = await model.generateContentStream(enhancedPrompt)
      
      let fullContent = ''
      
      for await (const chunk of result.stream) {
        const chunkText = chunk.text()
        if (chunkText) {
          fullContent += chunkText
          yield {
            chunk: chunkText,
            isComplete: false
          }
        }
      }
      
      // Final chunk with metadata
      yield {
        chunk: '',
        isComplete: true,
        metadata: {
          confidence: this.calculateResponseConfidence(fullContent, oceanData),
          dataInsights: this.extractDataInsights(fullContent, oceanData),
          visualizationSuggestions: this.extractVisualizationSuggestions(fullContent),
          followUpQuestions: this.generateFollowUpQuestions(query, fullContent)
        }
      }
    } catch (error) {
      console.error('Streaming error:', error)
      yield {
        chunk: 'I encountered an error processing your request. Please try again.',
        isComplete: true
      }
    }
  }

  private buildEnhancedPrompt(query: string, oceanData?: any, history?: Array<{role: string, content: string}>): string {
    const systemPrompt = `You are OceoChat, an advanced AI oceanographic assistant. Respond in a conversational, helpful style similar to ChatGPT.

RESPONSE FORMAT (like ChatGPT):
Start with "Got it 👍" or similar acknowledgment, then structure your response with proper line breaks:

🌊 **Quick Answer**

Give a direct, clear answer to the user's question in 1-2 sentences.

🔍 **Key Findings**

• Bullet point 1 with specific data or insight
• Bullet point 2 with measurements or trends  
• Bullet point 3 with important context
• Bullet point 4 with implications

🧪 **Scientific Context**

Explain the oceanographic processes and scientific background in 2-3 paragraphs. Use proper paragraph breaks between different concepts.

Each paragraph should focus on a specific aspect of the science.

📊 **Data Analysis** (if data available)

Analyze specific measurements, trends, and patterns with numerical details. Break into multiple paragraphs if needed.

⚡ **Practical Applications**

• Real-world use case 1
• Real-world use case 2  
• Real-world use case 3

👉 **What You Can Do Next**

• Specific actionable step 1
• Specific actionable step 2
• Specific actionable step 3

WRITING STYLE:
- Conversational and helpful like ChatGPT
- Use emojis for section headers
- Include specific numbers and measurements
- Explain technical terms clearly
- Be encouraging and supportive

CRITICAL FORMATTING RULES:
- Always put TWO line breaks after each section header
- Put ONE line break between paragraphs
- Put ONE line break between bullet points
- Never put all content in one continuous block
- Use proper spacing to make content readable`

    let dataContext = ''
    if (oceanData && Object.keys(oceanData).length > 0) {
      dataContext = `\n\nAVAILABLE OCEAN DATA:\n${JSON.stringify(oceanData, null, 2)}\n\nAnalyze this real data in your response.`
    }

    let conversationContext = ''
    if (history && history.length > 0) {
      const recentHistory = history.slice(-3).map(msg => 
        `${msg.role}: ${msg.content.substring(0, 300)}`
      ).join('\n')
      conversationContext = `\n\nCONVERSATION CONTEXT:\n${recentHistory}`
    }

    return `${systemPrompt}${dataContext}${conversationContext}\n\nUser Query: "${query}"\n\nProvide a comprehensive, well-structured response:`
  }

  private shouldUseFastModel(query: string): boolean {
    // Use fast model for simple queries
    const simplePatterns = [
      /^what is/i,
      /^define/i,
      /^explain briefly/i,
      /^quick question/i
    ]
    
    return simplePatterns.some(pattern => pattern.test(query)) || query.length < 50
  }

  private categorizeConversation(context: string): 'research' | 'analysis' | 'data' | 'general' {
    const lowerContext = context.toLowerCase()
    
    if (lowerContext.includes('research') || lowerContext.includes('study') || lowerContext.includes('paper')) {
      return 'research'
    }
    if (lowerContext.includes('analysis') || lowerContext.includes('analyze') || lowerContext.includes('trend')) {
      return 'analysis'
    }
    if (lowerContext.includes('data') || lowerContext.includes('argo') || lowerContext.includes('temperature')) {
      return 'data'
    }
    return 'general'
  }

  private calculateNamingConfidence(name: string, context: string): number {
    let confidence = 0.7 // Base confidence
    
    // Increase confidence for specific oceanographic terms
    const oceanTerms = ['argo', 'temperature', 'salinity', 'current', 'ocean', 'marine', 'coastal']
    const nameWords = name.toLowerCase().split(' ')
    const matchingTerms = nameWords.filter(word => oceanTerms.some(term => word.includes(term)))
    
    confidence += matchingTerms.length * 0.1
    
    // Decrease confidence for generic terms
    if (name.toLowerCase().includes('chat') || name.toLowerCase().includes('conversation')) {
      confidence -= 0.2
    }
    
    return Math.min(Math.max(confidence, 0.3), 0.95)
  }

  private calculateResponseConfidence(content: string, oceanData?: any): number {
    let confidence = 0.8 // Base confidence
    
    // Increase confidence if real data is used
    if (oceanData && Object.keys(oceanData).length > 0) {
      confidence += 0.1
    }
    
    // Increase confidence for structured responses
    if (content.includes('**') && content.includes('•')) {
      confidence += 0.05
    }
    
    // Increase confidence for specific measurements
    if (/\d+\.?\d*\s*(°C|PSU|m\/s|m|km)/g.test(content)) {
      confidence += 0.05
    }
    
    return Math.min(confidence, 0.95)
  }

  private extractDataInsights(content: string, oceanData?: any): string[] {
    const insights = []
    
    // Extract numerical insights
    const numberMatches = content.match(/\d+\.?\d*\s*(°C|PSU|m\/s|m|km)/g)
    if (numberMatches) {
      insights.push(`Specific measurements identified: ${numberMatches.slice(0, 3).join(', ')}`)
    }
    
    // Extract trend insights
    if (content.toLowerCase().includes('increase') || content.toLowerCase().includes('decrease')) {
      insights.push('Trend analysis indicates significant changes in oceanographic parameters')
    }
    
    // Extract data quality insights
    if (oceanData && oceanData.argo) {
      insights.push(`Analysis based on ${oceanData.argo.length || 0} ARGO float profiles`)
    }
    
    return insights.slice(0, 3)
  }

  private extractVisualizationSuggestions(content: string): string[] {
    const suggestions = []
    
    if (content.toLowerCase().includes('temperature')) {
      suggestions.push('Temperature profile visualization')
    }
    if (content.toLowerCase().includes('salinity')) {
      suggestions.push('Salinity distribution map')
    }
    if (content.toLowerCase().includes('time') || content.toLowerCase().includes('trend')) {
      suggestions.push('Time series analysis chart')
    }
    if (content.toLowerCase().includes('current')) {
      suggestions.push('Ocean current vector plot')
    }
    
    return suggestions.slice(0, 3)
  }

  private generateFollowUpQuestions(query: string, response: string): string[] {
    const questions = []
    const lowerQuery = query.toLowerCase()
    
    if (lowerQuery.includes('temperature')) {
      questions.push('How do seasonal variations affect these temperature patterns?')
      questions.push('What are the implications for marine ecosystems?')
    }
    
    if (lowerQuery.includes('argo')) {
      questions.push('How does this data compare to satellite observations?')
      questions.push('What quality control measures were applied to this data?')
    }
    
    if (lowerQuery.includes('current')) {
      questions.push('How do these currents influence regional climate?')
      questions.push('What are the long-term trends in current patterns?')
    }
    
    // Generic follow-ups
    questions.push('Would you like to see a visualization of this data?')
    questions.push('How does this relate to climate change impacts?')
    
    return questions.slice(0, 3)
  }

  private generateCacheKey(query: string, oceanData?: any): string {
    const queryHash = query.toLowerCase().replace(/\s+/g, '_').substring(0, 50)
    const dataHash = oceanData ? JSON.stringify(oceanData).substring(0, 100) : 'no_data'
    return `${queryHash}_${dataHash}`
  }

  // Clear cache periodically to prevent memory issues
  clearCache(): void {
    this.cache.clear()
  }

  // Get cache statistics
  getCacheStats(): {size: number, keys: string[]} {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    }
  }
}

// Singleton instance
let enhancedAIEngine: EnhancedAIEngine | null = null

export function getEnhancedAIEngine(): EnhancedAIEngine | null {
  if (!process.env.GEMINI_API_KEY) {
    return null
  }
  
  if (!enhancedAIEngine) {
    enhancedAIEngine = new EnhancedAIEngine(process.env.GEMINI_API_KEY)
  }
  
  return enhancedAIEngine
}
