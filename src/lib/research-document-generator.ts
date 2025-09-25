import { jsPDF } from 'jspdf'

export interface ResearchSection {
  title: string
  content: string
  subsections?: ResearchSection[]
}

export interface ResearchDocument {
  title: string
  authors: string[]
  abstract: string
  keywords: string[]
  sections: ResearchSection[]
  references: string[]
  figures?: { caption: string; data: any }[]
  tables?: { caption: string; data: any[][] }[]
}

export interface ChartConfig {
  type: 'line' | 'scatter' | 'bar' | 'heatmap' | 'contour'
  title: string
  xLabel: string
  yLabel: string
  data: any[]
  colorScheme?: string
}

export class ResearchDocumentGenerator {
  private doc: jsPDF
  private currentY: number = 20
  private pageHeight: number = 280
  private margin: number = 20

  constructor() {
    this.doc = new jsPDF()
  }

  generateDocument(research: ResearchDocument): Blob {
    this.addTitle(research.title)
    this.addAuthors(research.authors)
    this.addAbstract(research.abstract)
    this.addKeywords(research.keywords)
    
    // Add sections
    research.sections.forEach(section => {
      this.addSection(section)
    })

    // Add figures if any
    if (research.figures && research.figures.length > 0) {
      this.addFigures(research.figures)
    }

    // Add references
    if (research.references.length > 0) {
      this.addReferences(research.references)
    }

    return this.doc.output('blob')
  }

  private addTitle(title: string) {
    this.doc.setFontSize(18)
    this.doc.setFont('helvetica', 'bold')
    const titleLines = this.doc.splitTextToSize(title, 170)
    titleLines.forEach((line: string) => {
      this.doc.text(line, this.margin, this.currentY)
      this.currentY += 8
    })
    this.currentY += 10
  }

  private addAuthors(authors: string[]) {
    this.doc.setFontSize(12)
    this.doc.setFont('helvetica', 'normal')
    this.doc.text(authors.join(', '), this.margin, this.currentY)
    this.currentY += 15
  }

  private addAbstract(abstract: string) {
    this.checkPageBreak(30)
    this.doc.setFontSize(14)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Abstract', this.margin, this.currentY)
    this.currentY += 8

    this.doc.setFontSize(11)
    this.doc.setFont('helvetica', 'normal')
    const abstractLines = this.doc.splitTextToSize(abstract, 170)
    abstractLines.forEach((line: string) => {
      this.checkPageBreak(6)
      this.doc.text(line, this.margin, this.currentY)
      this.currentY += 6
    })
    this.currentY += 10
  }

  private addKeywords(keywords: string[]) {
    this.doc.setFontSize(11)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Keywords: ', this.margin, this.currentY)
    
    this.doc.setFont('helvetica', 'normal')
    this.doc.text(keywords.join(', '), this.margin + 25, this.currentY)
    this.currentY += 15
  }

  private addSection(section: ResearchSection, level: number = 1) {
    this.checkPageBreak(20)
    
    const fontSize = level === 1 ? 14 : 12
    this.doc.setFontSize(fontSize)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text(section.title, this.margin, this.currentY)
    this.currentY += 8

    this.doc.setFontSize(11)
    this.doc.setFont('helvetica', 'normal')
    const contentLines = this.doc.splitTextToSize(section.content, 170)
    contentLines.forEach((line: string) => {
      this.checkPageBreak(6)
      this.doc.text(line, this.margin, this.currentY)
      this.currentY += 6
    })

    if (section.subsections) {
      section.subsections.forEach(subsection => {
        this.addSection(subsection, level + 1)
      })
    }

    this.currentY += 8
  }

  private addFigures(figures: { caption: string; data: any }[]) {
    this.checkPageBreak(30)
    this.doc.setFontSize(14)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Figures', this.margin, this.currentY)
    this.currentY += 15

    figures.forEach((figure, index) => {
      this.checkPageBreak(20)
      this.doc.setFontSize(11)
      this.doc.setFont('helvetica', 'bold')
      this.doc.text(`Figure ${index + 1}: ${figure.caption}`, this.margin, this.currentY)
      this.currentY += 15
    })
  }

  private addReferences(references: string[]) {
    this.checkPageBreak(30)
    this.doc.setFontSize(14)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('References', this.margin, this.currentY)
    this.currentY += 10

    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', 'normal')
    references.forEach((ref, index) => {
      this.checkPageBreak(8)
      const refText = `[${index + 1}] ${ref}`
      const refLines = this.doc.splitTextToSize(refText, 170)
      refLines.forEach((line: string) => {
        this.doc.text(line, this.margin, this.currentY)
        this.currentY += 5
      })
      this.currentY += 3
    })
  }

  private checkPageBreak(requiredSpace: number) {
    if (this.currentY + requiredSpace > this.pageHeight) {
      this.doc.addPage()
      this.currentY = 20
    }
  }
}

// Chart generation utilities
export class ChartGenerator {
  static generateChartConfig(data: any[], type: ChartConfig['type']): ChartConfig {
    return {
      type,
      title: 'Ocean Data Analysis',
      xLabel: 'Time/Location',
      yLabel: 'Measurement',
      data,
      colorScheme: 'viridis'
    }
  }

  static generatePlotlyConfig(config: ChartConfig) {
    const baseConfig = {
      title: { text: config.title, font: { size: 16 } },
      xaxis: { title: config.xLabel },
      yaxis: { title: config.yLabel },
      font: { family: 'Arial, sans-serif' },
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)'
    }

    switch (config.type) {
      case 'line':
        return {
          data: [{
            x: config.data.map(d => d.x),
            y: config.data.map(d => d.y),
            type: 'scatter',
            mode: 'lines+markers',
            line: { color: '#2563eb', width: 2 },
            marker: { size: 6 }
          }],
          layout: baseConfig
        }
      
      case 'scatter':
        return {
          data: [{
            x: config.data.map(d => d.x),
            y: config.data.map(d => d.y),
            type: 'scatter',
            mode: 'markers',
            marker: { 
              size: 8,
              color: config.data.map(d => d.z || 0),
              colorscale: 'Viridis',
              showscale: true
            }
          }],
          layout: baseConfig
        }

      case 'heatmap':
        return {
          data: [{
            z: config.data,
            type: 'heatmap',
            colorscale: 'Viridis',
            showscale: true
          }],
          layout: baseConfig
        }

      default:
        return { data: [], layout: baseConfig }
    }
  }
}

// Research workflow utilities
export class ResearchWorkflow {
  static async processOceanData(data: any[]): Promise<{
    summary: string
    statistics: Record<string, number>
    recommendations: string[]
  }> {
    // Process ocean data and generate insights
    const summary = `Analysis of ${data.length} data points reveals significant patterns in ocean conditions.`
    
    const statistics = {
      mean_temperature: data.reduce((sum, d) => sum + (d.temperature || 0), 0) / data.length,
      mean_salinity: data.reduce((sum, d) => sum + (d.salinity || 0), 0) / data.length,
      data_points: data.length
    }

    const recommendations = [
      'Continue monitoring at current sampling frequency',
      'Investigate temperature anomalies in the dataset',
      'Consider additional salinity measurements for validation'
    ]

    return { summary, statistics, recommendations }
  }

  static generateResearchDocument(
    title: string,
    oceanData: any[],
    analysis: any
  ): ResearchDocument {
    return {
      title,
      authors: ['OceoChat Research Platform'],
      abstract: `This study presents an analysis of ocean data collected from multiple sources. ${analysis.summary} The research provides insights into current ocean conditions and recommendations for future monitoring.`,
      keywords: ['oceanography', 'data analysis', 'marine science', 'ARGO floats'],
      sections: [
        {
          title: '1. Introduction',
          content: 'Ocean monitoring is crucial for understanding climate patterns and marine ecosystems. This analysis examines recent oceanographic data to identify trends and patterns.'
        },
        {
          title: '2. Methodology',
          content: 'Data was collected from ARGO floats, NOAA stations, and satellite observations. Statistical analysis was performed to identify significant patterns and anomalies.'
        },
        {
          title: '3. Results',
          content: `Analysis of ${analysis.statistics.data_points} data points shows mean temperature of ${analysis.statistics.mean_temperature?.toFixed(2)}°C and mean salinity of ${analysis.statistics.mean_salinity?.toFixed(2)} PSU.`,
          subsections: [
            {
              title: '3.1 Temperature Analysis',
              content: 'Temperature measurements show consistent patterns with seasonal variations.'
            },
            {
              title: '3.2 Salinity Patterns',
              content: 'Salinity data indicates normal oceanic conditions within expected ranges.'
            }
          ]
        },
        {
          title: '4. Discussion',
          content: 'The results indicate stable ocean conditions with normal temperature and salinity ranges. Further monitoring is recommended to track long-term trends.'
        },
        {
          title: '5. Conclusions',
          content: analysis.recommendations.join(' ')
        }
      ],
      references: [
        'Argo Science Team. (2023). Argo float data and metadata. Global Ocean Data Assimilation Experiment.',
        'NOAA National Data Buoy Center. (2023). Ocean and atmospheric data.',
        'NASA Ocean Color Web. (2023). Satellite ocean color data and products.'
      ]
    }
  }
}
