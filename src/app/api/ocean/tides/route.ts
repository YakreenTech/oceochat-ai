import { NextRequest, NextResponse } from 'next/server'

// NOAA Tides & Currents proxy
// API docs: https://api.tidesandcurrents.noaa.gov/api/prod/ 
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const station = searchParams.get('station')
    let date = searchParams.get('date') || 'today'

    if (!station) {
      return NextResponse.json({ error: 'Missing station parameter' }, { status: 400 })
    }

    // Allow special keyword 'latest' to map to 'today'
    if (date === 'latest') date = 'today'

    const qs = new URLSearchParams({
      product: 'predictions',
      application: 'OceoChat',
      datum: 'MLLW',
      station,
      time_zone: 'lst_ldt',
      units: 'metric',
      interval: 'hilo',
      format: 'json',
      date,
    })

    const url = `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?${qs.toString()}`
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } })
    if (!res.ok) {
      return NextResponse.json({ error: 'NOAA upstream error', status: res.status }, { status: 502 })
    }
    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    console.error('NOAA tides proxy error:', err)
    return NextResponse.json({ error: 'Failed to fetch tides data' }, { status: 500 })
  }
}
