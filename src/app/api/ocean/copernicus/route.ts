import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = searchParams.get('lat')
    const lon = searchParams.get('lon')
    const startDate = searchParams.get('startDate') || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const endDate = searchParams.get('endDate') || new Date().toISOString().split('T')[0]
    const product = searchParams.get('product') || 'temperature'

    if (!lat || !lon) {
      return NextResponse.json({ error: 'Missing required parameters: lat, lon' }, { status: 400 })
    }

    // Marine Copernicus Service endpoint (mock implementation)
    // Real endpoint would be: https://marine.copernicus.eu/services-portfolio/access-to-products/
    
    const mockData = {
      metadata: {
        source: 'Copernicus Marine Environment Monitoring Service (CMEMS)',
        product: product,
        model: 'GLOBAL_ANALYSIS_FORECAST_PHY_001_024',
        spatial_resolution: '1/12°',
        temporal_resolution: 'daily',
        location: { lat: parseFloat(lat), lon: parseFloat(lon) },
        date_range: { start: startDate, end: endDate }
      },
      data: {
        sea_surface_temperature: {
          value: Math.random() * 8 + 22, // °C
          units: 'degrees_celsius',
          depth: 0,
          quality_flag: 'good'
        },
        sea_surface_height: {
          value: Math.random() * 0.4 - 0.2, // m
          units: 'meters',
          quality_flag: 'good'
        },
        ocean_currents: {
          u_velocity: Math.random() * 0.6 - 0.3, // m/s
          v_velocity: Math.random() * 0.6 - 0.3, // m/s
          speed: Math.sqrt(Math.pow(Math.random() * 0.6 - 0.3, 2) + Math.pow(Math.random() * 0.6 - 0.3, 2)),
          units: 'm/s',
          depth: 0
        },
        salinity: {
          value: Math.random() * 2 + 34, // PSU
          units: 'psu',
          depth: 0,
          quality_flag: 'good'
        },
        mixed_layer_depth: {
          value: Math.random() * 80 + 20, // m
          units: 'meters',
          quality_flag: 'good'
        }
      },
      forecast: {
        temperature_trend: Math.random() > 0.5 ? 'increasing' : 'decreasing',
        current_strength: Math.random() > 0.6 ? 'strong' : 'moderate',
        weather_conditions: Math.random() > 0.4 ? 'calm' : 'rough'
      },
      analysis: {
        ocean_regime: Math.random() > 0.5 ? 'subtropical' : 'tropical',
        upwelling_activity: Math.random() > 0.7 ? 'active' : 'inactive',
        eddy_activity: Math.random() > 0.6 ? 'high' : 'low'
      }
    }

    return NextResponse.json(mockData)
  } catch (error) {
    console.error('Copernicus Marine API Error:', error)
    return NextResponse.json({ error: 'Failed to fetch Copernicus Marine data' }, { status: 500 })
  }
}
