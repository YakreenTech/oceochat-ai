import { NextRequest, NextResponse } from 'next/server'
import { ResearchDocumentGenerator } from '@/lib/research-doc-generator'

export async function POST(request: NextRequest) {
  try {
    const { query, oceanData, analysis, region, format = 'pdf' } = await request.json()

    if (!query || !analysis) {
      return NextResponse.json({ error: 'Query and analysis required' }, { status: 400 })
    }

    // Generate research document
    const document = await ResearchDocumentGenerator.generateDocument({
      query,
      oceanData: oceanData || {},
      analysis,
      region
    })

    let exportData: Blob
    let mimeType: string
    let filename: string

    if (format === 'pdf') {
      exportData = await ResearchDocumentGenerator.exportAsPDF(document)
      mimeType = 'application/pdf'
      filename = `${document.title.replace(/\s+/g, '_')}.pdf`
    } else if (format === 'docx') {
      exportData = await ResearchDocumentGenerator.exportAsWord(document)
      mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      filename = `${document.title.replace(/\s+/g, '_')}.docx`
    } else {
      // Return JSON format
      return NextResponse.json({
        success: true,
        document,
        filename: `${document.title.replace(/\s+/g, '_')}.json`
      })
    }

    // Convert blob to base64 for JSON response
    const arrayBuffer = await exportData.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')

    return NextResponse.json({
      success: true,
      data: base64,
      mimeType,
      filename,
      document: {
        title: document.title,
        metadata: document.metadata
      }
    })
  } catch (error) {
    console.error('Research document export error:', error)
    return NextResponse.json({ error: 'Failed to generate research document' }, { status: 500 })
  }
}
