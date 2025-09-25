import { NextRequest } from 'next/server'
import { RESEARCH_SYSTEM_PROMPT } from '@/lib/research-prompts'
import { getModelSelector } from '@/lib/gemini-model-selector'
import { oceanDataService } from '@/lib/ocean-apis'

export const runtime = 'nodejs'

// Enhanced ocean data service for streaming (real APIs when possible)
async function searchOceanData(query: string) {
  try {
    const oceanData: Record<string, unknown> = {}
    
    // Detect what kind of ocean data is needed - be more inclusive
    const needsArgoData = /\b(argo|float|temperature|salinity|profile|ctd|deep|ocean|water|analysis)\b/i.test(query)
    const needsNOAAData = /\b(noaa|tide|current|water level|station|coastal|shore)\b/i.test(query)
    const needsNASAData = /\b(nasa|satellite|chlorophyll|ocean color|modis|viirs|surface|productivity)\b/i.test(query)
    const needsCopernicusData = /\b(copernicus|forecast|model|ssh|sea surface|circulation)\b/i.test(query)
    
    // If no specific data type detected, default to ARGO data for general ocean queries
    if (!needsArgoData && !needsNOAAData && !needsNASAData && !needsCopernicusData) {
      const hasOceanTerms = /\b(ocean|marine|sea|water|atlantic|pacific|indian|arctic|research|data)\b/i.test(query)
      if (hasOceanTerms) {
        console.log('Defaulting to ARGO data for general ocean query')
        return { oceanData: await oceanDataService.getArgoFloats({ 
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0]
        })}
      }
    }
    
    // Extract region if mentioned
    const locationMatch = query.match(/(mumbai|chennai|kerala|goa|bengal|arabian|indian ocean|latitude.*longitude)/i)
    const region = locationMatch ? locationMatch[0] : 'Indian Ocean'

    const getRegionBounds = (region: string) => {
      const bounds: Record<string, any> = {
        'Arabian Sea': { north: 25, south: 10, east: 75, west: 60 },
        'Bay of Bengal': { north: 22, south: 5, east: 95, west: 80 },
        'Indian Ocean': { north: 30, south: -30, east: 120, west: 40 }
      }
      return bounds[region] || bounds['Indian Ocean']
    }
    const getRegionPolygon = (region: string): number[][] => {
      const polygons: Record<string, number[][]> = {
        'Arabian Sea': [[60, 10], [75, 10], [75, 25], [60, 25], [60, 10]],
        'Bay of Bengal': [[80, 5], [95, 5], [95, 22], [80, 22], [80, 5]],
        'Indian Ocean': [[40, -30], [120, -30], [120, 30], [40, 30], [40, -30]]
      }
      return polygons[region] || polygons['Indian Ocean']
    }
    const getStationForRegion = (region: string): string => {
      const stations: Record<string, string> = {
        'mumbai': '9414290', 'chennai': '9414290', 'kerala': '9414290', 'goa': '9414290'
      }
      return stations[region.toLowerCase()] || '9414290'
    }

    if (needsArgoData) {
      const endDate = new Date().toISOString().split('T')[0]
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      ;(oceanData as any).argo = await oceanDataService.getArgoFloats({ startDate, endDate, polygon: getRegionPolygon(region) })
    }
    if (needsNOAAData) {
      const endDate = new Date().toISOString().split('T')[0]
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      ;(oceanData as any).noaa = await oceanDataService.getNOAAData({ station: getStationForRegion(region), product: 'predictions', begin_date: startDate, end_date: endDate })
    }
    if (needsNASAData) {
      const bounds = getRegionBounds(region)
      const endTime = new Date().toISOString().split('T')[0]
      const startTime = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      ;(oceanData as any).nasa = await oceanDataService.getNASAOceanColor({ sensor: 'MODIS', product: 'chlor_a', startTime, endTime, ...bounds })
    }
    if (needsCopernicusData) {
      const bounds = getRegionBounds(region)
      const endTime = new Date().toISOString()
      const startTime = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      ;(oceanData as any).copernicus = await oceanDataService.getCopernicusData({ product: 'GLOBAL_ANALYSIS_FORECAST_PHY_001_024', variable: ['temperature', 'salinity', 'currents'], longitude: [bounds.west, bounds.east], latitude: [bounds.south, bounds.north], time: [startTime, endTime] })
    }

    return { oceanData }
  } catch (e) {
    return { oceanData: {} }
  }
}

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const { message } = await request.json()

        // Get automatic model selector
        const modelSelector = getModelSelector()
        if (!modelSelector) {
          // Provide a helpful response when API key is not configured
          const fallbackResponse = `I'm currently running in demo mode without AI capabilities configured. 

To enable full AI functionality, please:
1. Get a Google Gemini API key from https://makersuite.google.com/app/apikey
2. Add it to your .env.local file as: GEMINI_API_KEY=your_key_here
3. Restart the development server

For now, I can help you with:
- Ocean data structure and analysis guidance
- Research methodology suggestions  
- Dataset recommendations
- Oceanographic concepts and explanations

What would you like to know about ocean research?`

          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: fallbackResponse })}\n\n`))
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
          return
        }

        // Enhanced ocean data lookup
        const { oceanData } = await searchOceanData(message || '')
        
        // Log ocean data for debugging
        console.log('Ocean data retrieved:', JSON.stringify(oceanData, null, 2))
        
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ meta: { oceanData } })}\n\n`))

        // Optionally perform research mode lookups
        const wantsResearch = /\b(research|sources?|references?|browse|find articles?|web search)\b/i.test(message || '')
        let references: Array<{ index: number; title: string; url: string }> | null = null
        if (wantsResearch) {
          try {
            const q = encodeURIComponent(message.slice(0, 300))
            const searchRes = await fetch(`/api/search?q=${q}`, { cache: 'no-store' }).catch(() => null)
            const searchJson = searchRes && searchRes.ok ? await searchRes.json() : { results: [] }
            const results = (searchJson.results || []).slice(0, 3)
            const excerpts: Array<{ url: string; title: string; excerpt: string }> = []
            for (const r of results) {
              try {
                const u = encodeURIComponent(r.link)
                const b = await fetch(`/api/browse?url=${u}`, { cache: 'no-store' })
                if (b.ok) {
                  const bj = await b.json()
                  const excerpt: string = String(bj.text || '').slice(0, 2000)
                  excerpts.push({ url: r.link, title: r.title, excerpt })
                }
              } catch {}
            }
            references = excerpts.map((e, i) => ({ index: i + 1, title: e.title, url: e.url }))
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ meta: { references } })}\n\n`))
          } catch {}
        }

        // Get the best available model automatically
        const { model: geminiModel, modelName } = await modelSelector.getBestModel()
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ meta: { modelUsed: modelName } })}\n\n`))

        // Check for tool usage in the message
        const toolMatch = message.match(/\[Using ([^\]]+)\](.+)/)
        const toolName = toolMatch ? toolMatch[1] : null
        const actualQuery = toolMatch ? toolMatch[2].trim() : message

        // Enhanced prompt for research platform
        const citations = references?.map((r) => `[[${r.index}]] ${r.title} — ${r.url}`).join('\n') || ''
        let toolContext = ''
        
        if (toolName) {
          switch (toolName) {
            case 'Analyze ARGO float data':
              toolContext = '\n\nSPECIAL INSTRUCTIONS: Focus on ARGO float data analysis. Provide detailed temperature and salinity profiles, identify water mass characteristics, and suggest oceanographic interpretations.'
              break
            case 'Search ocean databases':
              toolContext = '\n\nSPECIAL INSTRUCTIONS: Act as a database search specialist. Recommend specific datasets, provide data access methods, and suggest quality control procedures.'
              break
            case 'Generate research charts':
              toolContext = '\n\nSPECIAL INSTRUCTIONS: Focus on data visualization. Recommend specific chart types, color schemes, axis configurations, and provide detailed plotting instructions.'
              break
            case 'Create research document':
              toolContext = '\n\nSPECIAL INSTRUCTIONS: Structure your response as a research document with abstract, methodology, results, and conclusions. Use formal scientific writing style.'
              break
            case 'Deep ocean analysis':
              toolContext = '\n\nSPECIAL INSTRUCTIONS: Provide advanced oceanographic analysis including statistical methods, uncertainty quantification, and research recommendations.'
              break
          }
        }

        // Create data-driven prompt based on available ocean data
        let dataContext = ''
        if (oceanData && Object.keys(oceanData).length > 0) {
          dataContext = `\n\nREAL OCEAN DATA AVAILABLE:\n${JSON.stringify(oceanData, null, 2)}\n\nIMPORTANT: Use this REAL data in your response. Analyze the actual values, trends, and measurements provided.`
        } else {
          dataContext = '\n\nNOTE: No specific ocean data available for this query. Provide general oceanographic guidance and suggest data sources.'
        }

        const enhancedPrompt = `${RESEARCH_SYSTEM_PROMPT}${toolContext}${dataContext}

User Query: "${actualQuery}"

CRITICAL RESPONSE INSTRUCTIONS:
You must provide a comprehensive, well-structured response that follows this exact format:

1. **DIRECT ANSWER**: Begin with 1-2 sentences directly answering the user's question
2. **KEY INSIGHTS**: Present 3-4 bullet points with the most important findings or data points
3. **DETAILED EXPLANATION**: Provide 2-3 paragraphs explaining the scientific context, processes, and mechanisms
4. **DATA ANALYSIS**: If ocean data is available, analyze specific values, trends, and patterns with numerical details
5. **PRACTICAL APPLICATIONS**: Explain real-world significance and applications
6. **NEXT STEPS**: Suggest 2-3 specific follow-up questions or research directions

MANDATORY WRITING STANDARDS:
- Each sentence must be complete and grammatically correct
- Use clear topic sentences for each paragraph
- Maintain consistent scientific terminology throughout
- Include specific measurements, coordinates, and data values when available
- Separate different topics with clear paragraph breaks
- Use active voice and professional tone
- Explain all technical terms and acronyms
- Provide context for all numerical values (units, significance, comparisons)

QUALITY CHECKLIST:
✓ Response directly addresses the user's question
✓ Information is organized logically from general to specific
✓ All sentences are complete and well-structured
✓ Technical terms are clearly explained
✓ Specific data values are included where relevant
✓ Response ends with actionable next steps

${citations ? `\nCite sources inline as [n] and include a References section:\n${citations}\n` : ''}`

        // Generate response and stream it
        const result = await geminiModel.generateContent(enhancedPrompt)
        const response = result.response.text()
        
        // Split response into chunks for streaming effect
        const words = response.split(' ')
        const chunks = []
        for (let i = 0; i < words.length; i += 3) {
          chunks.push(words.slice(i, i + 3).join(' '))
        }

        for (const chunk of chunks) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ chunk })}\n\n`))
          await new Promise((r) => setTimeout(r, 50))
        }
        
        controller.close()
      } catch (err) {
        console.error('Streaming error:', err)
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ chunk: 'Sorry, an error occurred while processing your research query.' })}\n\n`))
        controller.close()
      }
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  })
}
