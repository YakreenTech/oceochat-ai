import { NextRequest, NextResponse } from 'next/server'
import { oceanDataService } from '@/lib/ocean-data-service'

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json()

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 })
    }

    // Search ocean data based on the query
    const oceanData = await oceanDataService.searchOceanData(query)

    return NextResponse.json({
      success: true,
      data: oceanData,
      timestamp: new Date().toISOString(),
      query: query
    })
  } catch (error) {
    console.error('Ocean data API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch ocean data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = searchParams.get('lat')
    const lon = searchParams.get('lon')
    const dataType = searchParams.get('type') || 'argo'

    if (!lat || !lon) {
      return NextResponse.json({ error: 'Latitude and longitude are required' }, { status: 400 })
    }

    let data

    switch (dataType) {
      case 'argo':
        data = await oceanDataService.getArgoFloats({
          lat: parseFloat(lat),
          lon: parseFloat(lon),
          radius: 100
        })
        break
      case 'tides':
        data = await oceanDataService.getNOAATides('9411340', {
          begin_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          product: 'predictions'
        })
        break
      default:
        data = await oceanDataService.searchOceanData(`data near ${lat},${lon}`)
    }

    return NextResponse.json({
      success: true,
      data,
      location: { lat: parseFloat(lat), lon: parseFloat(lon) },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Ocean data GET API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch ocean data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
