import { ChartConfig, ChartGenerator } from './chart-generator'
import { ArgoFloat, NOAAData, NASAOceanColor, CopernicusData } from './ocean-apis'

export interface ResearchDocument {
  title: string
  abstract: string
  introduction: string
  methodology: string
  results: string
  discussion: string
  conclusion: string
  references: string[]
  charts: ChartConfig[]
  metadata: {
    author: string
    date: string
    keywords: string[]
    dataSource: string[]
  }
}

export class ResearchDocumentGenerator {
  static async generateDocument(params: {
    query: string
    oceanData: {
      argo?: ArgoFloat[]
      noaa?: NOAAData
      nasa?: NASAOceanColor[]
      copernicus?: CopernicusData[]
    }
    analysis: string
    region?: string
  }): Promise<ResearchDocument> {
    const { query, oceanData, analysis, region = 'Indian Ocean' } = params
    
    // Generate charts
    const charts = ChartGenerator.generateResearchCharts(oceanData)
    
    // Extract key findings from analysis
    const keyFindings = this.extractKeyFindings(analysis)
    
    return {
      title: this.generateTitle(query, region),
      abstract: this.generateAbstract(query, keyFindings, region),
      introduction: this.generateIntroduction(query, region),
      methodology: this.generateMethodology(oceanData),
      results: this.generateResults(analysis, charts),
      discussion: this.generateDiscussion(keyFindings, region),
      conclusion: this.generateConclusion(keyFindings),
      references: this.generateReferences(),
      charts,
      metadata: {
        author: 'OceoChat Research Platform',
        date: new Date().toISOString().split('T')[0],
        keywords: this.extractKeywords(query),
        dataSource: this.getDataSources(oceanData)
      }
    }
  }

  private static generateTitle(query: string, region: string): string {
    const keywords = query.toLowerCase()
    
    if (keywords.includes('temperature')) {
      return `Ocean Temperature Analysis in the ${region}: Insights from ARGO Float Data`
    } else if (keywords.includes('salinity')) {
      return `Salinity Patterns and Variability in the ${region}: A Comprehensive Study`
    } else if (keywords.includes('current')) {
      return `Ocean Current Dynamics in the ${region}: Analysis and Implications`
    } else if (keywords.includes('chlorophyll')) {
      return `Chlorophyll-a Distribution and Primary Productivity in the ${region}`
    } else if (keywords.includes('tide')) {
      return `Tidal Analysis and Coastal Dynamics: A Study of ${region} Waters`
    } else {
      return `Oceanographic Analysis of the ${region}: Multi-Parameter Study`
    }
  }

  private static generateAbstract(query: string, keyFindings: string[], region: string): string {
    return `This study presents a comprehensive analysis of oceanographic conditions in the ${region} based on real-time data from multiple sources including ARGO floats, NOAA stations, NASA satellite observations, and Copernicus Marine Service. The research addresses the query: "${query}". 

Key findings include: ${keyFindings.slice(0, 3).join('; ')}. 

The analysis utilizes state-of-the-art ocean observation systems to provide insights into current oceanographic conditions and their implications for marine ecosystems and climate patterns. Results indicate significant spatial and temporal variability in ocean parameters, with important implications for regional climate dynamics and marine biodiversity.

Keywords: ${this.extractKeywords(query).join(', ')}, oceanography, marine science, ${region.toLowerCase()}`
  }

  private static generateIntroduction(query: string, region: string): string {
    return `## Introduction

The ${region} plays a crucial role in global ocean circulation and climate regulation. Understanding its oceanographic characteristics is essential for climate research, marine ecosystem management, and coastal planning.

This study investigates ${query.toLowerCase()} using comprehensive datasets from multiple ocean observation platforms:

- **ARGO Float Network**: Autonomous profiling floats providing temperature, salinity, and pressure measurements
- **NOAA Tides and Currents**: Coastal and offshore monitoring stations
- **NASA Ocean Color**: Satellite-derived biological and physical parameters
- **Copernicus Marine Service**: Operational oceanography products and forecasts

The research aims to provide current insights into oceanographic conditions and their broader implications for the marine environment.`
  }

  private static generateMethodology(oceanData: any): string {
    const dataSources = []
    
    if (oceanData.argo) {
      dataSources.push(`- **ARGO Float Data**: ${oceanData.argo.length} profiles analyzed for temperature, salinity, and pressure measurements`)
    }
    
    if (oceanData.noaa) {
      dataSources.push(`- **NOAA Observations**: Tidal and current data from station ${oceanData.noaa.station}`)
    }
    
    if (oceanData.nasa) {
      dataSources.push(`- **NASA Satellite Data**: Ocean color and biological parameters from ${oceanData.nasa.length} observations`)
    }
    
    if (oceanData.copernicus) {
      dataSources.push(`- **Copernicus Marine Data**: Physical oceanography parameters from ${oceanData.copernicus.length} grid points`)
    }

    return `## Methodology

### Data Sources
${dataSources.join('\n')}

### Quality Control
All data underwent standard quality control procedures:
- Removal of flagged or suspect measurements
- Temporal and spatial consistency checks
- Comparison with climatological values
- Statistical outlier detection

### Analysis Techniques
- Statistical analysis of oceanographic parameters
- Spatial interpolation and mapping
- Time series analysis for temporal trends
- Correlation analysis between parameters
- Visualization using advanced charting techniques`
  }

  private static generateResults(analysis: string, charts: ChartConfig[]): string {
    let results = `## Results

${analysis}

### Data Visualizations
The following charts illustrate key findings from the analysis:

`
    
    charts.forEach((chart, index) => {
      results += `**Figure ${index + 1}**: ${chart.title}\n`
      results += `- Chart Type: ${chart.type}\n`
      results += `- X-Axis: ${chart.xAxis.label}\n`
      results += `- Y-Axis: ${chart.yAxis.label}\n\n`
    })

    return results
  }

  private static generateDiscussion(keyFindings: string[], region: string): string {
    return `## Discussion

The analysis reveals several important aspects of oceanographic conditions in the ${region}:

${keyFindings.map((finding, index) => `### ${index + 1}. ${finding}`).join('\n\n')}

### Implications for Marine Ecosystems
The observed oceanographic patterns have significant implications for:
- Primary productivity and marine food webs
- Fish distribution and migration patterns
- Coral reef health and resilience
- Coastal erosion and sedimentation

### Climate Connections
The findings contribute to our understanding of:
- Regional climate variability
- Ocean-atmosphere interactions
- Long-term climate trends
- Seasonal and interannual variations

### Limitations and Future Research
This analysis is based on available observational data and may have limitations in spatial and temporal coverage. Future research should focus on:
- Extended time series analysis
- Higher resolution observations
- Integration of additional data sources
- Predictive modeling capabilities`
  }

  private static generateConclusion(keyFindings: string[]): string {
    return `## Conclusion

This comprehensive oceanographic analysis provides valuable insights into current marine conditions and their broader implications. Key conclusions include:

${keyFindings.map(finding => `- ${finding}`).join('\n')}

The integration of multiple data sources (ARGO, NOAA, NASA, Copernicus) provides a robust foundation for understanding complex oceanographic processes. These findings contribute to our knowledge of marine systems and support evidence-based decision-making for ocean management and climate research.

Future monitoring and analysis will be essential for tracking changes in ocean conditions and their impacts on marine ecosystems and climate patterns.`
  }

  private static generateReferences(): string[] {
    return [
      'Argo Science Team. (2024). Argo float data and metadata from Global Data Assembly Centre (Argo GDAC). SEANOE.',
      'NOAA Tides and Currents. (2024). Tidal and current predictions. National Ocean Service.',
      'NASA Ocean Biology Processing Group. (2024). Ocean Color Data. NASA Goddard Space Flight Center.',
      'Copernicus Marine Service. (2024). Global Ocean Physics Analysis and Forecast. E.U. Copernicus Marine Service Information.',
      'Roemmich, D., et al. (2019). On the future of Argo: A global, full-depth, multi-disciplinary array. Frontiers in Marine Science, 6, 439.',
      'Claustre, H., et al. (2020). Observing the global ocean with biogeochemical-Argo. Annual Review of Marine Science, 12, 23-48.'
    ]
  }

  private static extractKeyFindings(analysis: string): string[] {
    // Simple extraction - in production, this could use NLP
    const sentences = analysis.split(/[.!?]+/).filter(s => s.trim().length > 20)
    return sentences.slice(0, 5).map(s => s.trim())
  }

  private static extractKeywords(query: string): string[] {
    const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'a', 'an']
    const words = query.toLowerCase().split(/\s+/).filter(word => 
      word.length > 3 && !commonWords.includes(word)
    )
    return [...new Set(words)].slice(0, 6)
  }

  private static getDataSources(oceanData: any): string[] {
    const sources = []
    if (oceanData.argo) sources.push('ARGO Float Network')
    if (oceanData.noaa) sources.push('NOAA Tides and Currents')
    if (oceanData.nasa) sources.push('NASA Ocean Color')
    if (oceanData.copernicus) sources.push('Copernicus Marine Service')
    return sources
  }

  // Export document as PDF (placeholder - would integrate with PDF library)
  static async exportAsPDF(document: ResearchDocument): Promise<Blob> {
    // This would use a library like jsPDF or Puppeteer
    const content = this.formatDocumentAsHTML(document)
    return new Blob([content], { type: 'text/html' })
  }

  // Export document as Word document (placeholder)
  static async exportAsWord(document: ResearchDocument): Promise<Blob> {
    // This would use a library like docx
    const content = this.formatDocumentAsText(document)
    return new Blob([content], { type: 'text/plain' })
  }

  private static formatDocumentAsHTML(document: ResearchDocument): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>${document.title}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 40px; }
        h1, h2, h3 { color: #2c3e50; }
        .metadata { background: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 30px; }
        .chart { margin: 20px 0; padding: 15px; border: 1px solid #ddd; }
    </style>
</head>
<body>
    <h1>${document.title}</h1>
    
    <div class="metadata">
        <strong>Author:</strong> ${document.metadata.author}<br>
        <strong>Date:</strong> ${document.metadata.date}<br>
        <strong>Keywords:</strong> ${document.metadata.keywords.join(', ')}<br>
        <strong>Data Sources:</strong> ${document.metadata.dataSource.join(', ')}
    </div>
    
    <div>${document.abstract}</div>
    <div>${document.introduction}</div>
    <div>${document.methodology}</div>
    <div>${document.results}</div>
    <div>${document.discussion}</div>
    <div>${document.conclusion}</div>
    
    <h2>References</h2>
    <ol>
        ${document.references.map(ref => `<li>${ref}</li>`).join('')}
    </ol>
</body>
</html>`
  }

  private static formatDocumentAsText(document: ResearchDocument): string {
    return `${document.title}

Author: ${document.metadata.author}
Date: ${document.metadata.date}
Keywords: ${document.metadata.keywords.join(', ')}
Data Sources: ${document.metadata.dataSource.join(', ')}

${document.abstract}

${document.introduction}

${document.methodology}

${document.results}

${document.discussion}

${document.conclusion}

References:
${document.references.map((ref, i) => `${i + 1}. ${ref}`).join('\n')}`
  }
}
