import { NextRequest, NextResponse } from 'next/server'
import { ChartGenerator } from '@/lib/chart-generator'

export async function POST(request: NextRequest) {
  try {
    const { chartConfig, format = 'png' } = await request.json()

    if (!chartConfig) {
      return NextResponse.json({ error: 'Chart configuration required' }, { status: 400 })
    }

    // Generate chart image
    const imageData = await ChartGenerator.exportChartAsImage(chartConfig)

    return NextResponse.json({
      success: true,
      imageData,
      format,
      filename: `${chartConfig.title.replace(/\s+/g, '_')}.${format}`
    })
  } catch (error) {
    console.error('Chart export error:', error)
    return NextResponse.json({ error: 'Failed to export chart' }, { status: 500 })
  }
}
