import { GoogleGenerativeAI } from '@google/generative-ai'

export interface OceanData {
  argoData?: {
    floats: Array<{
      id: string
      lat: number
      lon: number
      date: string
      temperature: number
      salinity: number
      depth: number
    }>
    analysis: {
      temperatureTrend: string
      salinityPattern: string
      recommendations: string[]
    }
  }
  noaaData?: {
    tides: Array<{
      time: string
      height: number
      type: 'high' | 'low'
    }>
    currents: Array<{
      speed: number
      direction: string
      location: { lat: number; lon: number }
    }>
  }
  nasaData?: {
    satellite: {
      chlorophyll: number
      temperature: number
      date: string
      quality: string
    }
    analysis: string
  }
}

export interface ResearchContext {
  query: string
  userLevel: 'beginner' | 'intermediate' | 'expert'
  researchArea: string
  previousContext?: string[]
}

export interface AIResponse {
  answer: string
  oceanData?: OceanData
  visualizations: Array<{
    type: 'chart' | 'map' | 'table'
    title: string
    data: any
    description: string
  }>
  citations: Array<{
    source: string
    title: string
    url?: string
  }>
  followUpQuestions: string[]
}

class OceanResearchAI {
  private genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!)
  private model = this.genAI.getGenerativeModel({
    model: 'gemini-pro',
    generationConfig: {
      temperature: 0.3,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 8192,
    }
  })

  async processResearchQuery(
    query: string,
    context: ResearchContext,
    oceanData?: OceanData
  ): Promise<AIResponse> {
    try {
      const systemPrompt = this.buildOceanographyPrompt(context)
      const dataContext = this.formatOceanData(oceanData)
      const userPrompt = this.buildUserPrompt(query, context)

      const fullPrompt = `${systemPrompt}

${dataContext ? `Available Ocean Data:\n${dataContext}\n` : ''}

User Query: ${userPrompt}

Provide a comprehensive, research-grade response including:
1. Analysis of the query with scientific context
2. Interpretation of any available ocean data
3. Statistical insights and trends if applicable
4. Visualization recommendations
5. Citations to relevant research
6. Suggested follow-up questions for deeper research

Response Format:
- Start with a clear, accessible explanation
- Include technical details for expert users
- Suggest specific data sources and methodologies
- Recommend appropriate visualizations
- Provide actionable research recommendations`

      const result = await this.model.generateContent(fullPrompt)
      const response = await result.response
      const text = response.text()

      return this.parseAIResponse(text, oceanData)
    } catch (error) {
      console.error('AI processing error:', error)
      throw new Error('Failed to process research query')
    }
  }

  private buildOceanographyPrompt(context: ResearchContext): string {
    const expertiseLevel = {
      beginner: 'Explain concepts simply with basic terminology',
      intermediate: 'Include technical details and intermediate concepts',
      expert: 'Use advanced terminology and research methodologies'
    }

    return `You are OceoChat, an expert oceanographic research assistant with comprehensive knowledge of:

🌊 PHYSICAL OCEANOGRAPHY:
- Ocean circulation patterns (Gulf Stream, Kuroshio Current, Indian Ocean Gyre)
- Temperature and salinity distributions
- Ocean-atmosphere interactions (ENSO, monsoons, upwelling)
- Sea level rise and coastal dynamics
- Ocean acoustics and sound propagation

🧪 CHEMICAL OCEANOGRAPHY:
- Carbon cycle and ocean acidification
- Nutrient distributions and primary productivity
- Oxygen minimum zones and anoxia
- Trace metal biogeochemistry
- Marine pollution and contaminants

🦠 BIOLOGICAL OCEANOGRAPHY:
- Marine ecosystems and biodiversity
- Phytoplankton blooms and algal dynamics
- Zooplankton communities and food webs
- Benthic communities and deep-sea biology
- Fisheries science and stock assessment

🌍 GLOBAL OCEAN SYSTEMS:
- Atlantic, Pacific, Indian, Arctic, and Southern Oceans
- Marginal seas and coastal zones
- Polar regions and sea ice dynamics
- Coral reef ecosystems and bleaching
- Mangrove and seagrass habitats

📊 RESEARCH METHODOLOGIES:
- ARGO float network (3000+ autonomous profilers)
- Satellite remote sensing (MODIS, VIIRS, Sentinel)
- Ocean gliders and AUVs
- Moorings and fixed observatories
- Research vessels and survey methods

🛠 DATA SOURCES & TOOLS:
- NOAA National Data Buoy Center
- NASA Ocean Biology Processing Group
- ARGO Data Management System
- World Ocean Database
- Marine Copernicus (European ocean data)
- INCOIS (Indian National Centre for Ocean Information Services)

${expertiseLevel[context.userLevel]}

Research Area Focus: ${context.researchArea}

Provide scientifically accurate, well-cited responses that advance oceanographic research and education.`
  }

  private formatOceanData(oceanData?: OceanData): string | null {
    if (!oceanData) return null

    let formatted = ''

    if (oceanData.argoData) {
      formatted += `ARGO FLOAT DATA:
- Number of floats: ${oceanData.argoData.floats.length}
- Latest measurements:
${oceanData.argoData.floats.slice(0, 3).map(f =>
  `  • Float ${f.id}: ${f.temperature}°C, ${f.salinity} PSU at ${f.depth}m depth`
).join('\n')}

Analysis: ${oceanData.argoData.analysis.temperatureTrend}
Salinity Pattern: ${oceanData.argoData.analysis.salinityPattern}
Recommendations: ${oceanData.argoData.analysis.recommendations.join(', ')}

`
    }

    if (oceanData.noaaData) {
      formatted += `NOAA DATA:
- Tide predictions available: ${oceanData.noaaData.tides.length}
- Current measurements: ${oceanData.noaaData.currents.length} records

`
    }

    if (oceanData.nasaData) {
      formatted += `NASA SATELLITE DATA:
- Chlorophyll: ${oceanData.nasaData.satellite.chlorophyll} mg/m³
- Sea Surface Temperature: ${oceanData.nasaData.satellite.temperature}°C
- Data Quality: ${oceanData.nasaData.satellite.quality}

Analysis: ${oceanData.nasaData.analysis}

`
    }

    return formatted
  }

  private buildUserPrompt(query: string, context: ResearchContext): string {
    return `Research Query: "${query}"

User Level: ${context.userLevel}
Research Area: ${context.researchArea}
${context.previousContext ? `Previous Context: ${context.previousContext.join(' → ')}` : ''}

Please provide a comprehensive analysis addressing this research question.`
  }

  private parseAIResponse(text: string, oceanData?: OceanData): AIResponse {
    // This would parse the AI response and structure it properly
    // For now, return a basic structure
    return {
      answer: text,
      oceanData,
      visualizations: this.generateVisualizationRecommendations(text, oceanData),
      citations: this.extractCitations(text),
      followUpQuestions: this.generateFollowUpQuestions(text)
    }
  }

  private generateVisualizationRecommendations(text: string, oceanData?: OceanData): AIResponse['visualizations'] {
    const visualizations: AIResponse['visualizations'] = []

    if (text.includes('temperature') || text.includes('trend')) {
      visualizations.push({
        type: 'chart',
        title: 'Temperature Time Series',
        data: { type: 'line', parameter: 'temperature' },
        description: 'Temporal analysis of ocean temperature variations'
      })
    }

    if (text.includes('salinity') || text.includes('salt')) {
      visualizations.push({
        type: 'chart',
        title: 'Salinity Profile',
        data: { type: 'scatter', parameter: 'salinity' },
        description: 'Vertical distribution of salinity in the water column'
      })
    }

    if (text.includes('current') || text.includes('flow')) {
      visualizations.push({
        type: 'map',
        title: 'Ocean Current Patterns',
        data: { type: 'vector', parameter: 'currents' },
        description: 'Spatial distribution of ocean current velocities'
      })
    }

    if (text.includes('chlorophyll') || text.includes('productivity')) {
      visualizations.push({
        type: 'chart',
        title: 'Chlorophyll Concentration',
        data: { type: 'heatmap', parameter: 'chlorophyll' },
        description: 'Marine primary productivity indicators'
      })
    }

    return visualizations
  }

  private extractCitations(text: string): AIResponse['citations'] {
    // Extract and format citations from the AI response
    const citations: AIResponse['citations'] = []

    // Example citations - in a real implementation, this would parse the response
    citations.push(
      {
        source: 'ARGO Data Management System',
        title: 'Global Ocean Temperature and Salinity Profiles',
        url: 'https://argo.ucsd.edu/'
      },
      {
        source: 'NOAA National Data Buoy Center',
        title: 'Real-time Ocean Observations',
        url: 'https://ndbc.noaa.gov/'
      },
      {
        source: 'NASA Ocean Biology Processing Group',
        title: 'Satellite Ocean Color Data',
        url: 'https://oceancolor.gsfc.nasa.gov/'
      }
    )

    return citations
  }

  private generateFollowUpQuestions(text: string): string[] {
    // Generate relevant follow-up questions based on the response
    return [
      'What are the seasonal variations in this region?',
      'How do these patterns compare to other ocean basins?',
      'What are the implications for marine ecosystems?',
      'What additional data would help clarify these findings?',
      'How might climate change affect these patterns in the future?'
    ]
  }

  // Ocean knowledge database
  getOceanKnowledge(): Record<string, any> {
    return {
      oceans: {
        pacific: {
          area: '165.2 million km²',
          deepest: 'Mariana Trench (11,034m)',
          currents: ['Kuroshio Current', 'California Current', 'North Equatorial Current'],
          features: ['Great Pacific Garbage Patch', 'Ring of Fire', 'Pacific Decadal Oscillation']
        },
        atlantic: {
          area: '85.1 million km²',
          currents: ['Gulf Stream', 'North Atlantic Drift', 'Canary Current'],
          features: ['Mid-Atlantic Ridge', 'Sargasso Sea', 'Atlantic Meridional Overturning Circulation']
        },
        indian: {
          area: '70.6 million km²',
          features: ['Indian Ocean Dipole', 'Bay of Bengal', 'Arabian Sea', 'Monsoon Gyre'],
          currents: ['Somali Current', 'Agulhas Current', 'South Equatorial Current']
        },
        arctic: {
          area: '14.1 million km²',
          features: ['Arctic sea ice', 'Northwest Passage', 'Arctic Council'],
          climate: 'Rapid warming, sea ice decline, permafrost thaw'
        },
        southern: {
          area: '20.3 million km²',
          features: ['Antarctic Circumpolar Current', 'Southern Ocean carbon sink'],
          currents: ['Antarctic Circumpolar Current', 'Weddell Gyre', 'Ross Gyre']
        }
      },
      marineLife: {
        phytoplankton: {
          role: 'Primary producers, oxygen production, carbon sequestration',
          blooms: 'Triggered by nutrient upwelling, seasonal cycles',
          indicators: 'Ocean health, climate change impacts'
        },
        zooplankton: {
          types: ['Copepods', 'Krill', 'Jellyfish', 'Larval fish'],
          role: 'Food web transfer, carbon transport to deep ocean'
        },
        fish: {
          commercial: ['Tuna', 'Salmon', 'Cod', 'Sardines', 'Mackerel'],
          migration: 'Diel vertical migration, seasonal spawning migrations'
        }
      },
      climate: {
        enso: {
          phases: ['El Niño', 'La Niña', 'Neutral'],
          impacts: 'Global weather patterns, fisheries, agriculture',
          monitoring: 'Sea surface temperature anomalies in Pacific'
        },
        monsoons: {
          regions: ['Indian Ocean', 'West Africa', 'East Asia'],
          mechanism: 'Seasonal wind reversal due to land-sea temperature contrast'
        },
        acidification: {
          cause: 'Ocean CO2 absorption, decreased pH',
          impacts: 'Coral dissolution, shellfish vulnerability, ecosystem disruption'
        }
      }
    }
  }
}

export const oceanResearchAI = new OceanResearchAI()
