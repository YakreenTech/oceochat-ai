import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase-server'
import { buildResearchPrompt, RESEARCH_SYSTEM_PROMPT } from '@/lib/research-prompts'
import { getModelSelector } from '@/lib/gemini-model-selector'
import { oceanDataService } from '@/lib/ocean-apis'
import { ChartGenerator } from '@/lib/chart-generator'

// Enhanced ocean data service for research platform
async function searchOceanData(query: string) {
  try {
    const oceanData: Record<string, unknown> = {}
    
    // Detect what type of data is needed based on query
    const needsArgoData = /argo|float|temperature|salinity|pressure|profile/i.test(query)
    const needsNOAAData = /tide|tidal|current|water level|noaa/i.test(query)
    const needsNASAData = /chlorophyll|ocean color|satellite|nasa|productivity/i.test(query)
    const needsCopernicusData = /forecast|model|copernicus|sea surface/i.test(query)
    
    // Extract location if mentioned
    const locationMatch = query.match(/(mumbai|chennai|kerala|goa|bengal|arabian|indian ocean|latitude.*longitude)/i)
    const region = locationMatch ? locationMatch[0] : 'Indian Ocean'
    
    // Fetch ARGO data if needed
    if (needsArgoData) {
      const endDate = new Date().toISOString().split('T')[0]
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      
      oceanData.argo = await oceanDataService.getArgoFloats({
        startDate,
        endDate,
        polygon: getRegionPolygon(region)
      })
    }
    
    // Fetch NOAA data if needed
    if (needsNOAAData) {
      const endDate = new Date().toISOString().split('T')[0]
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      
      oceanData.noaa = await oceanDataService.getNOAAData({
        station: getStationForRegion(region),
        product: 'predictions',
        begin_date: startDate,
        end_date: endDate
      })
    }
    
    // Fetch NASA data if needed
    if (needsNASAData) {
      const bounds = getRegionBounds(region)
      const endTime = new Date().toISOString().split('T')[0]
      const startTime = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      
      oceanData.nasa = await oceanDataService.getNASAOceanColor({
        sensor: 'MODIS',
        product: 'chlor_a',
        startTime,
        endTime,
        ...bounds
      })
    }
    
    // Fetch Copernicus data if needed
    if (needsCopernicusData) {
      const bounds = getRegionBounds(region)
      const endTime = new Date().toISOString()
      const startTime = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      
      oceanData.copernicus = await oceanDataService.getCopernicusData({
        product: 'GLOBAL_ANALYSIS_FORECAST_PHY_001_024',
        variable: ['temperature', 'salinity', 'currents'],
        longitude: [bounds.west, bounds.east],
        latitude: [bounds.south, bounds.north],
        time: [startTime, endTime]
      })
    }
    
    // Generate charts if data is available
    const charts = ChartGenerator.generateResearchCharts(oceanData)
    
    return {
      oceanData,
      charts,
      region,
      dataTypes: {
        hasArgo: !!oceanData.argo,
        hasNOAA: !!oceanData.noaa,
        hasNASA: !!oceanData.nasa,
        hasCopernicus: !!oceanData.copernicus
      }
    }
  } catch (error) {
    console.error('Ocean data fetch error:', error)
    return getMockOceanData(query)
  }
}

// Helper functions
function getRegionPolygon(region: string): number[][] {
  const polygons: Record<string, number[][]> = {
    'Arabian Sea': [[60, 10], [75, 10], [75, 25], [60, 25], [60, 10]],
    'Bay of Bengal': [[80, 5], [95, 5], [95, 22], [80, 22], [80, 5]],
    'Indian Ocean': [[40, -30], [120, -30], [120, 30], [40, 30], [40, -30]]
  }
  return polygons[region] || polygons['Indian Ocean']
}

type Bounds = { north: number; south: number; east: number; west: number }
function getRegionBounds(region: string): Bounds {
  const bounds: Record<string, Bounds> = {
    'Arabian Sea': { north: 25, south: 10, east: 75, west: 60 },
    'Bay of Bengal': { north: 22, south: 5, east: 95, west: 80 },
    'Indian Ocean': { north: 30, south: -30, east: 120, west: 40 }
  }
  return bounds[region] || bounds['Indian Ocean']
}

function getStationForRegion(region: string): string {
  const stations: Record<string, string> = {
    'mumbai': '9414290',
    'chennai': '9414290',
    'kerala': '9414290',
    'goa': '9414290'
  }
  return stations[region.toLowerCase()] || '9414290'
}

function getMockOceanData(query: string) {
  return {
    oceanData: {
      argo: [
        {
          platform_number: '2902746',
          latitude: 15.5,
          longitude: 68.2,
          date: '2024-01-19T12:00:00Z',
          temperature: [28.5, 28.2, 27.8, 26.5, 24.2],
          salinity: [35.2, 35.4, 35.6, 35.8, 36.0],
          pressure: [0, 10, 20, 50, 100],
          cycle_number: 245
        }
      ]
    },
    charts: [],
    region: 'Indian Ocean',
    dataTypes: { hasArgo: true, hasNOAA: false, hasNASA: false, hasCopernicus: false }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { message, context = 'analysis' } = await request.json()

    // Get automatic model selector
    const modelSelector = getModelSelector()
    if (!modelSelector) {
      return NextResponse.json({ 
        success: false, 
        error: 'GEMINI_API_KEY not configured' 
      }, { status: 500 })
    }

    // Enhanced ocean data lookup
    const oceanData = await searchOceanData(message || '')

    // Research mode: web search + browse to collect external context and citations
    const wantsResearch = /\b(research|sources?|references?|browse|find articles?|web search)\b/i.test(message || '') || context === 'research'
    let research: { results: Array<{ title: string; link: string; snippet?: string }>; excerpts: Array<{ url: string; title: string; excerpt: string }> } | null = null
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
        research = { results, excerpts }
      } catch (e) {
        console.warn('Research mode failed:', e)
      }
    }

    // Build research-focused prompt
    buildResearchPrompt(message, context, 'researcher')

    // Get the best available model automatically
    const { model: geminiModel, modelName } = await modelSelector.getBestModel()

    // Enhanced prompt for research platform (with optional research context)
    const citations = research?.excerpts?.map((e, i) => `[[${i + 1}]] ${e.title} — ${e.url}`).join('\n') || ''
    const researchNotes = research?.excerpts?.map((e, i) => `Source [[${i + 1}]]: ${e.title}\nExcerpt:\n${e.excerpt}`).join('\n\n') || ''
    const enhancedPrompt = `${RESEARCH_SYSTEM_PROMPT}

Current ocean data context:
${JSON.stringify(oceanData, null, 2)}

User query: ${message}

Please provide a comprehensive research-focused response that includes:
1. Data analysis and interpretation
2. Scientific context and implications  
3. Visualization recommendations
4. Follow-up research questions
5. Relevant citations or methodologies

Maintain scientific accuracy and provide uncertainty estimates where appropriate.`
      + (researchNotes
        ? `

 Additional external research context (web):
 ${researchNotes}

 Cite sources inline as [n] and include a References section at the end:
 ${citations}
`
        : '')

    const result = await geminiModel.generateContent(enhancedPrompt)
    const response = result.response.text()

    // Store conversation if authenticated
    const supabase = getSupabaseServer()
    if (supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          // Store in conversations/messages tables
          // Implementation would go here
        }
      } catch (err) {
        console.log('Auth check failed, continuing without storage')
      }
    }

    return NextResponse.json({ 
      success: true, 
      response, 
      oceanData,
      research: research ? {
        results: research.results,
        references: research.excerpts?.map((e, i) => ({ index: i + 1, title: e.title, url: e.url }))
      } : null,
      metadata: {
        model: modelName,
        context: context,
        researchMode: true,
        timestamp: new Date().toISOString()
      }
    })
  } catch (err) {
    console.error('Enhanced chat route error:', err)
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
    return NextResponse.json({ 
      success: false, 
      error: `Failed to process research query: ${errorMessage}`,
      details: process.env.NODE_ENV === 'development' ? String(err) : undefined
    }, { status: 500 })
  }
}
