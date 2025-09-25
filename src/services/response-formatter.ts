// Response Formatter for ChatGPT-style structured responses
import { OceanDataCollection } from './ocean-intelligence'

export interface FormattedResponse {
  content: string
  visualizations: any[]
  tables: any[]
  maps: any[]
  followUpQuestions: string[]
}

export interface ResponseSection {
  emoji: string
  title: string
  content: string[]
  type: 'overview' | 'analysis' | 'steps' | 'data' | 'recommendations'
}

export class ResponseFormatter {
  
  // Format response in ChatGPT style with emojis and structure
  static formatChatGPTStyle(
    query: string,
    analysis: string,
    oceanData?: OceanDataCollection,
    confidence?: number
  ): FormattedResponse {
    
    const sections = this.extractSections(analysis, oceanData)
    const formattedContent = this.buildFormattedContent(sections, query)
    const visualizations = this.generateVisualizations(oceanData, query)
    const tables = this.generateTables(oceanData)
    const maps = this.generateMaps(oceanData, query)
    const followUpQuestions = this.generateFollowUps(query, analysis)
    
    return {
      content: formattedContent,
      visualizations,
      tables,
      maps,
      followUpQuestions
    }
  }

  private static extractSections(analysis: string, oceanData?: OceanDataCollection): ResponseSection[] {
    const sections: ResponseSection[] = []
    
    // Overview section
    sections.push({
      emoji: '🌊',
      title: 'Ocean Analysis Overview',
      content: this.extractOverview(analysis),
      type: 'overview'
    })
    
    // Key findings
    if (analysis.includes('Key Insights') || analysis.includes('findings')) {
      sections.push({
        emoji: '🔍',
        title: 'Key Findings',
        content: this.extractKeyFindings(analysis),
        type: 'analysis'
      })
    }
    
    // Data analysis
    if (oceanData && Object.keys(oceanData).length > 0) {
      sections.push({
        emoji: '📊',
        title: 'Data Analysis',
        content: this.extractDataAnalysis(analysis, oceanData),
        type: 'data'
      })
    }
    
    // Scientific context
    sections.push({
      emoji: '🧪',
      title: 'Scientific Context',
      content: this.extractScientificContext(analysis),
      type: 'analysis'
    })
    
    // Practical applications
    sections.push({
      emoji: '⚡',
      title: 'Practical Applications',
      content: this.extractPracticalApplications(analysis),
      type: 'recommendations'
    })
    
    // Next steps
    sections.push({
      emoji: '👉',
      title: 'What You Can Do Next',
      content: this.extractNextSteps(analysis),
      type: 'steps'
    })
    
    return sections
  }

  private static buildFormattedContent(sections: ResponseSection[], query: string): string {
    let content = `Got it 👍. Let me analyze the oceanographic data for your query about **${query}**.\n\n`
    
    sections.forEach((section, index) => {
      content += `## ${section.emoji} ${section.title}\n`
      
      section.content.forEach(item => {
        if (section.type === 'steps' || section.type === 'recommendations') {
          content += `• **${item}**\n`
        } else {
          content += `${item}\n\n`
        }
      })
      
      if (index < sections.length - 1) {
        content += '\n'
      }
    })
    
    return content
  }

  private static extractOverview(analysis: string): string[] {
    // Extract the first paragraph or direct answer
    const sentences = analysis.split(/[.!?]+/)
    const overview = sentences.slice(0, 3).join('. ').trim()
    return [overview + '.']
  }

  private static extractKeyFindings(analysis: string): string[] {
    const findings = []
    
    // Look for bullet points or numbered items
    const bulletPattern = /[•*-]\s*(.+)/g
    const matches = analysis.match(bulletPattern)
    
    if (matches) {
      findings.push(...matches.map(m => m.replace(/[•*-]\s*/, '').trim()))
    } else {
      // Extract sentences with key terms
      const keyTerms = ['temperature', 'salinity', 'current', 'data', 'analysis', 'significant']
      const sentences = analysis.split(/[.!?]+/)
      
      keyTerms.forEach(term => {
        const relevantSentences = sentences.filter(s => 
          s.toLowerCase().includes(term) && s.length > 20
        )
        findings.push(...relevantSentences.slice(0, 1))
      })
    }
    
    return findings.slice(0, 4)
  }

  private static extractDataAnalysis(analysis: string, oceanData: OceanDataCollection): string[] {
    const dataPoints = []
    
    // Extract numerical values and measurements
    const numberPattern = /\d+\.?\d*\s*(°C|PSU|m\/s|m|km|meters|degrees)/g
    const measurements = analysis.match(numberPattern) || []
    
    if (measurements.length > 0) {
      dataPoints.push(`**Measurements Found:** ${measurements.slice(0, 3).join(', ')}`)
    }
    
    // Add data source information
    if (oceanData.argo && oceanData.argo.length > 0) {
      dataPoints.push(`**ARGO Floats:** ${oceanData.argo.length} profiles analyzed`)
    }
    
    if (oceanData.noaa && Object.keys(oceanData.noaa).length > 0) {
      dataPoints.push(`**NOAA Data:** Tidal and current information available`)
    }
    
    if (oceanData.nasa && Object.keys(oceanData.nasa).length > 0) {
      dataPoints.push(`**NASA Satellite:** Sea surface temperature and chlorophyll data`)
    }
    
    return dataPoints.length > 0 ? dataPoints : ['Real-time oceanographic data analysis in progress.']
  }

  private static extractScientificContext(analysis: string): string[] {
    const contextSentences = analysis.split(/[.!?]+/)
    const scientificContext = contextSentences.filter(sentence => {
      const s = sentence.toLowerCase()
      return s.includes('ocean') || s.includes('marine') || s.includes('climate') || 
             s.includes('monsoon') || s.includes('seasonal') || s.includes('upwelling')
    })
    
    return scientificContext.slice(0, 3).map(s => s.trim() + '.')
  }

  private static extractPracticalApplications(analysis: string): string[] {
    const applications = []
    
    // Look for application-related content
    if (analysis.toLowerCase().includes('fisheries')) {
      applications.push('**Fisheries Management:** Understanding fish distribution and abundance patterns')
    }
    
    if (analysis.toLowerCase().includes('climate')) {
      applications.push('**Climate Research:** Monitoring ocean-atmosphere interactions')
    }
    
    if (analysis.toLowerCase().includes('monsoon')) {
      applications.push('**Weather Prediction:** Improving monsoon and seasonal forecasts')
    }
    
    if (analysis.toLowerCase().includes('pollution')) {
      applications.push('**Environmental Monitoring:** Tracking marine pollution and water quality')
    }
    
    // Default applications
    if (applications.length === 0) {
      applications.push(
        '**Marine Research:** Contributing to global ocean monitoring',
        '**Climate Studies:** Understanding regional climate patterns',
        '**Environmental Protection:** Supporting marine conservation efforts'
      )
    }
    
    return applications
  }

  private static extractNextSteps(analysis: string): string[] {
    const steps = []
    
    // Extract existing next steps if present
    const nextStepsSection = analysis.match(/Next Steps?:?\s*([\s\S]*?)(?=\n\n|\n[A-Z]|$)/i)
    if (nextStepsSection) {
      const stepText = nextStepsSection[1]
      const bulletPoints = stepText.match(/[•*-]\s*(.+)/g)
      if (bulletPoints) {
        steps.push(...bulletPoints.map(bp => bp.replace(/[•*-]\s*/, '').trim()))
      }
    }
    
    // Add default steps if none found
    if (steps.length === 0) {
      steps.push(
        'Request a visualization of this data',
        'Explore related oceanographic parameters',
        'Set up monitoring alerts for this region',
        'Download detailed research report'
      )
    }
    
    return steps.slice(0, 4)
  }

  private static generateVisualizations(oceanData?: OceanDataCollection, query?: string): any[] {
    const visualizations = []
    
    if (oceanData?.argo && oceanData.argo.length > 0) {
      visualizations.push({
        type: 'temperature_profile',
        title: 'ARGO Temperature Profiles',
        description: 'Vertical temperature distribution from ARGO floats',
        data: oceanData.argo,
        chartType: 'line'
      })
      
      visualizations.push({
        type: 'salinity_profile',
        title: 'Salinity Distribution',
        description: 'Water salinity measurements by depth',
        data: oceanData.argo,
        chartType: 'scatter'
      })
    }
    
    if (oceanData?.noaa) {
      visualizations.push({
        type: 'tidal_chart',
        title: 'Tidal Patterns',
        description: 'Tidal height variations over time',
        data: oceanData.noaa,
        chartType: 'area'
      })
    }
    
    return visualizations
  }

  private static generateTables(oceanData?: OceanDataCollection): any[] {
    const tables = []
    
    if (oceanData?.argo && oceanData.argo.length > 0) {
      tables.push({
        title: 'ARGO Float Summary',
        headers: ['Float ID', 'Latitude', 'Longitude', 'Max Depth', 'Temperature Range'],
        rows: oceanData.argo.slice(0, 10).map(float => [
          float.id || 'N/A',
          float.latitude?.toFixed(4) || 'N/A',
          float.longitude?.toFixed(4) || 'N/A',
          float.maxDepth ? `${float.maxDepth}m` : 'N/A',
          float.tempRange || 'N/A'
        ])
      })
    }
    
    return tables
  }

  private static generateMaps(oceanData?: OceanDataCollection, query?: string): any[] {
    const maps = []
    
    if (oceanData && (oceanData.argo?.length > 0 || oceanData.noaa || oceanData.nasa)) {
      maps.push({
        type: 'ocean_data_map',
        title: 'Ocean Data Locations',
        description: 'Geographic distribution of measurement points',
        center: { lat: 19.0760, lon: 72.8777 }, // Mumbai coordinates
        zoom: 8,
        layers: [
          {
            name: 'ARGO Floats',
            type: 'markers',
            data: oceanData.argo || [],
            color: '#3b82f6'
          },
          {
            name: 'NOAA Stations',
            type: 'markers', 
            data: oceanData.noaa ? [oceanData.noaa] : [],
            color: '#10b981'
          }
        ]
      })
    }
    
    return maps
  }

  private static generateFollowUps(query: string, analysis: string): string[] {
    const followUps = []
    const lowerQuery = query.toLowerCase()
    
    if (lowerQuery.includes('temperature')) {
      followUps.push('How do seasonal changes affect these temperature patterns?')
      followUps.push('What are the long-term temperature trends in this region?')
    }
    
    if (lowerQuery.includes('argo')) {
      followUps.push('Can you show me the complete ARGO float trajectory?')
      followUps.push('How does this ARGO data compare to satellite measurements?')
    }
    
    if (lowerQuery.includes('mumbai') || lowerQuery.includes('arabian')) {
      followUps.push('What are the monsoon impacts on Arabian Sea conditions?')
      followUps.push('How do these conditions affect marine life in the region?')
    }
    
    // Generic follow-ups
    followUps.push('Can you create a visualization of this data?')
    followUps.push('What are the climate change implications?')
    
    return [...new Set(followUps)].slice(0, 4)
  }
}

export { ResponseFormatter }
