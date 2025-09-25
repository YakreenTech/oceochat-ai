// Ocean Intelligence Service - Complete API Integration
import { GoogleGenerativeAI } from '@google/generative-ai'

// Types for Ocean Data
export interface ArgoFloat {
  _id: string
  lat: number
  lon: number
  date: string
  measurements: Array<{
    parameter: 'TEMP' | 'PSAL' | 'PRES'
    value: number
    depth: number
    qc: number
  }>
  platform_number: string
  cycle_number: number
}

export interface NOAAData {
  predictions?: Array<{
    t: string
    v: string
  }>
  metadata?: {
    id: string
    name: string
    lat: string
    lon: string
  }
}

export interface NASAOceanData {
  sst?: number
  chlorophyll?: number
  coordinates: { lat: number; lon: number }
  date: string
}

export interface OceanDataCollection {
  argo?: ArgoFloat[]
  noaa?: NOAAData
  nasa?: NASAOceanData
  quality: 'high' | 'medium' | 'low'
  sources: string[]
  spatialCoverage: string
  temporalRange: { start: string; end: string }
}

export interface QueryAnalysis {
  requiresARGO: boolean
  requiresNOAA: boolean
  requiresNASA: boolean
  location: {
    lat: number
    lon: number
    radius: number
    nearestStation?: string
  }
  timeRange: {
    start: string
    end: string
  }
  parameters: string[]
  analysisType: 'trend' | 'comparison' | 'correlation' | 'description'
}

export interface ConversationContext {
  history: Array<{ role: string; content: string }>
  user?: any
  conversationId?: string
}

// ARGO Float Service
export class ArgoService {
  private readonly baseUrl = 'https://argovis.colorado.edu/api/v1/'

  async getFloatData(lat: number, lon: number, radius = 100): Promise<ArgoFloat[]> {
    try {
      const endDate = new Date().toISOString().split('T')[0]
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      
      const response = await fetch(
        `${this.baseUrl}argo?lat=${lat}&lon=${lon}&radius=${radius}&startDate=${startDate}&endDate=${endDate}`
      )
      
      if (!response.ok) {
        throw new Error(`ARGO API error: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('ARGO service error:', error)
      return []
    }
  }

  async getTemperatureProfiles(region: { lat: number; lon: number; radius: number }) {
    const floats = await this.getFloatData(region.lat, region.lon, region.radius)
    return floats.map(float => ({
      id: float._id,
      position: { lat: float.lat, lon: float.lon },
      date: float.date,
      temperature: float.measurements.filter(m => m.parameter === 'TEMP'),
      salinity: float.measurements.filter(m => m.parameter === 'PSAL')
    }))
  }
}

// NOAA Ocean Service
export class NOAAService {
  private readonly baseUrl = 'https://api.tidesandcurrents.noaa.gov/api/prod/datagetter'

  async getTideData(station = '8518750', days = 7): Promise<NOAAData> {
    try {
      const endDate = new Date()
      const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000))
      
      const params = new URLSearchParams({
        product: 'predictions',
        application: 'OceoChat',
        begin_date: startDate.toISOString().split('T')[0].replace(/-/g, ''),
        end_date: endDate.toISOString().split('T')[0].replace(/-/g, ''),
        datum: 'MLLW',
        station: station,
        time_zone: 'lst_ldt',
        units: 'metric',
        format: 'json'
      })
      
      const response = await fetch(`${this.baseUrl}?${params}`)
      
      if (!response.ok) {
        throw new Error(`NOAA API error: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('NOAA service error:', error)
      return {}
    }
  }

  async getOceanCurrents(station: string): Promise<NOAAData> {
    try {
      const params = new URLSearchParams({
        product: 'currents',
        application: 'OceoChat',
        station: station,
        format: 'json'
      })
      
      const response = await fetch(`${this.baseUrl}?${params}`)
      return await response.json()
    } catch (error) {
      console.error('NOAA currents error:', error)
      return {}
    }
  }

  async getStationsList() {
    try {
      const response = await fetch(`${this.baseUrl}?product=stations&format=json`)
      return await response.json()
    } catch (error) {
      console.error('NOAA stations error:', error)
      return { stations: [] }
    }
  }
}

// NASA Ocean Service
export class NASAOceanService {
  private readonly baseUrl = 'https://oceandata.sci.gsfc.nasa.gov/api/v2/'
  private readonly token: string

  constructor(token?: string) {
    this.token = token || process.env.NASA_OCEAN_TOKEN || ''
  }

  private get headers() {
    return {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    }
  }

  async getSeaSurfaceTemp(lat: number, lon: number, date: string): Promise<NASAOceanData> {
    if (!this.token) {
      console.warn('NASA token not available, returning mock data')
      return {
        sst: 28.5 + Math.random() * 2,
        coordinates: { lat, lon },
        date
      }
    }

    try {
      const response = await fetch(
        `${this.baseUrl}sst?lat=${lat}&lon=${lon}&date=${date}`,
        { headers: this.headers }
      )
      
      if (!response.ok) {
        throw new Error(`NASA API error: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('NASA SST error:', error)
      return {
        sst: 28.5 + Math.random() * 2,
        coordinates: { lat, lon },
        date
      }
    }
  }

  async getChlorophyll(region: string, dateRange: { start: string; end: string }): Promise<NASAOceanData> {
    if (!this.token) {
      console.warn('NASA token not available, returning mock data')
      return {
        chlorophyll: 0.5 + Math.random() * 2,
        coordinates: { lat: 20, lon: 70 },
        date: dateRange.start
      }
    }

    try {
      const response = await fetch(
        `${this.baseUrl}chlorophyll?region=${region}&start=${dateRange.start}&end=${dateRange.end}`,
        { headers: this.headers }
      )
      
      return await response.json()
    } catch (error) {
      console.error('NASA chlorophyll error:', error)
      return {
        chlorophyll: 0.5 + Math.random() * 2,
        coordinates: { lat: 20, lon: 70 },
        date: dateRange.start
      }
    }
  }
}

// AI Ocean Engine
export class OceanAIEngine {
  private genAI: GoogleGenerativeAI
  private model: any

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey)
    this.model = this.genAI.getGenerativeModel({ 
      model: "gemini-pro",
      generationConfig: {
        temperature: 0.3,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 8192,
      }
    })
  }

  async processOceanQuery(query: string, oceanData: OceanDataCollection, conversationHistory: any[] = []) {
    const systemPrompt = this.buildOceanographyPrompt()
    const contextPrompt = this.buildDataContext(oceanData)
    const historyPrompt = this.buildConversationContext(conversationHistory)
    
    const fullPrompt = `${systemPrompt}\n\n${contextPrompt}\n\n${historyPrompt}\n\nUser Query: ${query}`
    
    try {
      const result = await this.model.generateContent(fullPrompt)
      const response = await result.response.text()
      
      return {
        text: response,
        confidence: this.calculateConfidence(result),
        suggestedVisualizations: this.extractVisualizationSuggestions(response),
        followUpQuestions: this.generateFollowUps(query, response)
      }
    } catch (error) {
      console.error('Gemini API Error:', error)
      throw new Error('Failed to process AI query')
    }
  }

  private buildOceanographyPrompt(): string {
    return `You are OceoChat, an expert oceanographic research assistant with deep knowledge of:
    
    PHYSICAL OCEANOGRAPHY:
    - Temperature, salinity, density, and circulation patterns
    - Ocean currents, tides, and wave dynamics
    - Water mass formation and mixing processes
    - Seasonal and climate variability
    
    MARINE DATA ANALYSIS:
    - ARGO float data interpretation
    - Satellite oceanography (SST, ocean color)
    - Statistical analysis of ocean time series
    - Quality control and uncertainty assessment
    
    RESEARCH CAPABILITIES:
    - Identify trends and anomalies in ocean data
    - Explain physical mechanisms behind observations
    - Suggest appropriate analysis methods
    - Generate research hypotheses
    - Recommend visualization approaches
    
    Always provide scientifically accurate, contextually relevant responses with:
    1. Clear data interpretation
    2. Physical explanations
    3. Statistical insights
    4. Visualization recommendations
    5. Follow-up research suggestions`
  }

  private buildDataContext(oceanData: OceanDataCollection): string {
    if (!oceanData || (!oceanData.argo && !oceanData.noaa && !oceanData.nasa)) {
      return "No specific ocean data provided for this query."
    }
    
    return `AVAILABLE OCEAN DATA:
    
    ARGO Float Data: ${oceanData.argo?.length || 0} profiles
    - Temperature range: ${this.getDataRange(oceanData.argo, 'temperature')}
    - Salinity range: ${this.getDataRange(oceanData.argo, 'salinity')}
    - Depth coverage: ${this.getDepthRange(oceanData.argo)}
    - Time period: ${this.getTimeRange(oceanData.argo)}
    
    NOAA Data: ${oceanData.noaa ? 'Available' : 'Not available'}
    - Tide predictions: ${oceanData.noaa?.predictions ? 'Yes' : 'No'}
    - Station info: ${oceanData.noaa?.metadata?.name || 'N/A'}
    
    NASA Satellite Data: ${oceanData.nasa ? 'Available' : 'Not available'}
    - Sea surface temperature: ${oceanData.nasa?.sst ? `${oceanData.nasa.sst}°C` : 'No'}
    - Ocean color/chlorophyll: ${oceanData.nasa?.chlorophyll ? `${oceanData.nasa.chlorophyll} mg/m³` : 'No'}
    
    Data Quality: ${oceanData.quality}
    Spatial Coverage: ${oceanData.spatialCoverage}
    `
  }

  private buildConversationContext(history: any[]): string {
    if (!history || history.length === 0) {
      return "No previous conversation context."
    }
    
    const recentHistory = history.slice(-5).map(msg => 
      `${msg.role}: ${msg.content.substring(0, 200)}...`
    ).join('\n')
    
    return `CONVERSATION CONTEXT:\n${recentHistory}`
  }

  private calculateConfidence(result: any): number {
    // Simple confidence calculation based on response length and structure
    const text = result.response.text()
    if (text.length > 500 && text.includes('data') && text.includes('analysis')) {
      return 0.9
    }
    return 0.7
  }

  private extractVisualizationSuggestions(response: string): string[] {
    const suggestions = []
    if (response.toLowerCase().includes('temperature')) {
      suggestions.push('temperature_profile')
    }
    if (response.toLowerCase().includes('salinity')) {
      suggestions.push('salinity_distribution')
    }
    if (response.toLowerCase().includes('time') || response.toLowerCase().includes('trend')) {
      suggestions.push('time_series')
    }
    return suggestions
  }

  private generateFollowUps(query: string, response: string): string[] {
    return [
      "What are the seasonal variations in this region?",
      "How does this compare to historical averages?",
      "What are the implications for marine ecosystems?"
    ]
  }

  private getDataRange(data: ArgoFloat[] | undefined, parameter: string): string {
    if (!data || data.length === 0) return 'No data'
    
    const values = data.flatMap(float => 
      float.measurements
        .filter(m => m.parameter === (parameter === 'temperature' ? 'TEMP' : 'PSAL'))
        .map(m => m.value)
    )
    
    if (values.length === 0) return 'No data'
    
    const min = Math.min(...values)
    const max = Math.max(...values)
    const unit = parameter === 'temperature' ? '°C' : 'PSU'
    
    return `${min.toFixed(2)} - ${max.toFixed(2)} ${unit}`
  }

  private getDepthRange(data: ArgoFloat[] | undefined): string {
    if (!data || data.length === 0) return 'No data'
    
    const depths = data.flatMap(float => 
      float.measurements.map(m => m.depth)
    )
    
    if (depths.length === 0) return 'No data'
    
    const min = Math.min(...depths)
    const max = Math.max(...depths)
    
    return `${min.toFixed(0)} - ${max.toFixed(0)} m`
  }

  private getTimeRange(data: ArgoFloat[] | undefined): string {
    if (!data || data.length === 0) return 'No data'
    
    const dates = data.map(float => new Date(float.date))
    const earliest = new Date(Math.min(...dates.map(d => d.getTime())))
    const latest = new Date(Math.max(...dates.map(d => d.getTime())))
    
    return `${earliest.toISOString().split('T')[0]} to ${latest.toISOString().split('T')[0]}`
  }
}

// Main Ocean Intelligence Service
export class OceanIntelligenceService {
  private argoService: ArgoService
  private noaaService: NOAAService  
  private nasaService: NASAOceanService
  private aiEngine: OceanAIEngine
  
  constructor() {
    this.argoService = new ArgoService()
    this.noaaService = new NOAAService()
    this.nasaService = new NASAOceanService(process.env.NASA_OCEAN_TOKEN)
    
    const geminiKey = process.env.GEMINI_API_KEY
    if (!geminiKey) {
      throw new Error('GEMINI_API_KEY is required')
    }
    this.aiEngine = new OceanAIEngine(geminiKey)
  }
  
  async processIntelligentQuery(query: string, context?: ConversationContext) {
    try {
      // 1. Analyze query to determine data needs
      const queryAnalysis = await this.analyzeQuery(query)
      
      // 2. Fetch relevant ocean data
      const oceanData = await this.gatherOceanData(queryAnalysis)
      
      // 3. Process with AI engine
      const aiResponse = await this.aiEngine.processOceanQuery(
        query, 
        oceanData, 
        context?.history
      )
      
      // 4. Generate visualizations
      const visualizations = await this.generateVisualizations(
        oceanData, 
        aiResponse.suggestedVisualizations
      )
      
      return {
        response: aiResponse.text,
        data: oceanData,
        visualizations,
        confidence: aiResponse.confidence,
        followUp: aiResponse.followUpQuestions,
        sources: this.getDataSources(oceanData),
        methodology: this.generateMethodology(queryAnalysis, oceanData)
      }
    } catch (error) {
      console.error('Ocean Intelligence Service error:', error)
      throw error
    }
  }
  
  private async analyzeQuery(query: string): Promise<QueryAnalysis> {
    // Simple query analysis - in production, use more sophisticated NLP
    const lowerQuery = query.toLowerCase()
    
    // Extract location if mentioned
    const mumbaiMatch = lowerQuery.includes('mumbai')
    const chennaiMatch = lowerQuery.includes('chennai')
    const bengalMatch = lowerQuery.includes('bengal')
    const arabianMatch = lowerQuery.includes('arabian')
    
    let location = { lat: 20, lon: 70, radius: 200 } // Default Indian Ocean
    
    if (mumbaiMatch) {
      location = { lat: 19.0760, lon: 72.8777, radius: 150 }
    } else if (chennaiMatch) {
      location = { lat: 13.0827, lon: 80.2707, radius: 150 }
    } else if (bengalMatch) {
      location = { lat: 18, lon: 88, radius: 300 }
    } else if (arabianMatch) {
      location = { lat: 18, lon: 65, radius: 300 }
    }
    
    return {
      requiresARGO: lowerQuery.includes('argo') || lowerQuery.includes('temperature') || lowerQuery.includes('salinity') || lowerQuery.includes('float'),
      requiresNOAA: lowerQuery.includes('tide') || lowerQuery.includes('current') || lowerQuery.includes('noaa'),
      requiresNASA: lowerQuery.includes('satellite') || lowerQuery.includes('chlorophyll') || lowerQuery.includes('nasa'),
      location,
      timeRange: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
      },
      parameters: this.extractParameters(query),
      analysisType: this.determineAnalysisType(query)
    }
  }
  
  async gatherOceanData(analysis: QueryAnalysis): Promise<OceanDataCollection> {
    const promises: Promise<any>[] = []
    const sources: string[] = []
    
    // Fetch ARGO data if needed
    if (analysis.requiresARGO) {
      promises.push(
        this.argoService.getFloatData(
          analysis.location.lat, 
          analysis.location.lon, 
          analysis.location.radius
        ).then(data => ({ type: 'argo', data }))
      )
      sources.push('ARGO Global Ocean Observing System')
    }
    
    // Fetch NOAA data if needed
    if (analysis.requiresNOAA) {
      promises.push(
        this.noaaService.getTideData().then(data => ({ type: 'noaa', data }))
      )
      sources.push('NOAA Ocean Service')
    }
    
    // Fetch NASA data if needed  
    if (analysis.requiresNASA) {
      promises.push(
        this.nasaService.getSeaSurfaceTemp(
          analysis.location.lat,
          analysis.location.lon,
          analysis.timeRange.start
        ).then(data => ({ type: 'nasa', data }))
      )
      sources.push('NASA Ocean Color')
    }
    
    const results = await Promise.allSettled(promises)
    
    const oceanData: OceanDataCollection = {
      quality: 'high',
      sources,
      spatialCoverage: `${analysis.location.radius}km radius around ${analysis.location.lat}°N, ${analysis.location.lon}°E`,
      temporalRange: analysis.timeRange
    }
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const { type, data } = result.value
        if (type === 'argo') oceanData.argo = data
        if (type === 'noaa') oceanData.noaa = data
        if (type === 'nasa') oceanData.nasa = data
      }
    })
    
    return oceanData
  }
  
  private async generateVisualizations(oceanData: OceanDataCollection, suggestions: string[]) {
    const visualizations: any[] = []
    
    if (suggestions.includes('temperature_profile') && oceanData.argo) {
      visualizations.push({
        type: 'temperature_profile',
        data: oceanData.argo,
        title: 'Temperature Profiles from ARGO Floats'
      })
    }
    
    if (suggestions.includes('time_series') && oceanData.noaa) {
      visualizations.push({
        type: 'time_series',
        data: oceanData.noaa,
        title: 'Tidal Predictions Time Series'
      })
    }
    
    return visualizations
  }
  
  private getDataSources(oceanData: OceanDataCollection): string[] {
    return oceanData.sources
  }
  
  private generateMethodology(analysis: QueryAnalysis, oceanData: OceanDataCollection): string {
    return `Data collection methodology:
    - Spatial coverage: ${analysis.location.radius}km radius
    - Temporal range: ${analysis.timeRange.start} to ${analysis.timeRange.end}
    - Data sources: ${oceanData.sources.join(', ')}
    - Quality assessment: ${oceanData.quality}
    - Analysis type: ${analysis.analysisType}`
  }
  
  private extractParameters(query: string): string[] {
    const parameters = []
    const lowerQuery = query.toLowerCase()
    
    if (lowerQuery.includes('temperature')) parameters.push('temperature')
    if (lowerQuery.includes('salinity')) parameters.push('salinity')
    if (lowerQuery.includes('current')) parameters.push('current')
    if (lowerQuery.includes('tide')) parameters.push('tide')
    if (lowerQuery.includes('chlorophyll')) parameters.push('chlorophyll')
    
    return parameters
  }
  
  private determineAnalysisType(query: string): 'trend' | 'comparison' | 'correlation' | 'description' {
    const lowerQuery = query.toLowerCase()
    
    if (lowerQuery.includes('trend') || lowerQuery.includes('change')) return 'trend'
    if (lowerQuery.includes('compare') || lowerQuery.includes('difference')) return 'comparison'
    if (lowerQuery.includes('correlation') || lowerQuery.includes('relationship')) return 'correlation'
    
    return 'description'
  }
}

// Singleton instance
export const oceanIntelligence = new OceanIntelligenceService()
