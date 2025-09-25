import { NextRequest, NextResponse } from 'next/server'

// Simple proxy to ARGO Argovis API with selected query params
// Docs: https://argovis.colorado.edu/docs/
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const lat = searchParams.get('lat')
    const lon = searchParams.get('lon')
    const radius = searchParams.get('radius')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const qs = new URLSearchParams()
    if (lat) qs.set('lat', lat)
    if (lon) qs.set('lon', lon)
    if (radius) qs.set('radius', radius)
    if (startDate) qs.set('startDate', startDate)
    if (endDate) qs.set('endDate', endDate)

    // Argovis endpoint (official host)
    const url = `https://argovis.colorado.edu/api/v1/argo?${qs.toString()}`
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } })
    if (!res.ok) {
      return NextResponse.json({ error: 'ARGO upstream error', status: res.status }, { status: 502 })
    }
    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    console.error('ARGO proxy error:', err)
    return NextResponse.json({ error: 'Failed to fetch ARGO data' }, { status: 500 })
  }
}
