import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = searchParams.get('lat')
    const lon = searchParams.get('lon')
    const startDate = searchParams.get('startDate') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const endDate = searchParams.get('endDate') || new Date().toISOString().split('T')[0]
    const product = searchParams.get('product') || 'chlor_a'

    if (!lat || !lon) {
      return NextResponse.json({ error: 'Missing required parameters: lat, lon' }, { status: 400 })
    }

    // NASA Ocean Color API endpoint (using OPeNDAP service)
    const nasaUrl = `https://oceandata.sci.gsfc.nasa.gov/opendap/MODISA/L3SMI/${startDate.replace(/-/g, '/')}/A${startDate.replace(/-/g, '')}${endDate.replace(/-/g, '')}.L3m_MO_CHL_chlor_a_9km.nc`
    
    // For demo purposes, return mock data structure similar to real NASA Ocean Color data
    const mockData = {
      metadata: {
        source: 'NASA Ocean Color (MODIS-Aqua)',
        product: product,
        spatial_resolution: '9km',
        temporal_resolution: 'monthly',
        location: { lat: parseFloat(lat), lon: parseFloat(lon) },
        date_range: { start: startDate, end: endDate }
      },
      data: {
        chlorophyll_a: {
          value: Math.random() * 10 + 0.1, // mg/m³
          units: 'mg/m³',
          quality_flag: 'good'
        },
        sea_surface_temperature: {
          value: Math.random() * 5 + 25, // °C
          units: 'degrees_celsius',
          quality_flag: 'good'
        },
        normalized_water_leaving_radiance: {
          value: Math.random() * 2 + 0.5,
          units: 'mW cm-2 μm-1 sr-1',
          quality_flag: 'good'
        },
        diffuse_attenuation_coefficient: {
          value: Math.random() * 0.5 + 0.05,
          units: 'm-1',
          quality_flag: 'good'
        }
      },
      analysis: {
        productivity_level: Math.random() > 0.5 ? 'high' : 'moderate',
        water_clarity: Math.random() > 0.3 ? 'clear' : 'turbid',
        bloom_probability: Math.random() > 0.7 ? 'likely' : 'unlikely'
      }
    }

    return NextResponse.json(mockData)
  } catch (error) {
    console.error('NASA Ocean Color API Error:', error)
    return NextResponse.json({ error: 'Failed to fetch NASA Ocean Color data' }, { status: 500 })
  }
}
