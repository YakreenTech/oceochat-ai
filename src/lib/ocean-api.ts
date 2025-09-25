export class OceanDataService {
  async getArgoFloats(params: { lat?: number; lon?: number; radius?: number }) {
    const qs = new URLSearchParams()
    if (params.lat) qs.append('lat', params.lat.toString())
    if (params.lon) qs.append('lon', params.lon.toString())
    if (params.radius) qs.append('radius', params.radius.toString())

    const url = `/api/ocean/argo?${qs.toString()}`
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`ARGO proxy error ${res.status}`)
      return await res.json()
    } catch {
      console.warn('ARGO proxy failed, attempting direct fetch...')
      // Fallback to direct ARGO if available
      try {
        const direct = await fetch(`https://argovis.colorado.edu/api/v1/argo?${qs.toString()}`)
        if (!direct.ok) throw new Error(`ARGO direct error ${direct.status}`)
        return await direct.json()
      } catch {
        console.warn('ARGO fetch failed, returning empty list.')
        return []
      }
    }
  }

  async getNoaaTides(params: { station: string; date: string }) {
    const qs = new URLSearchParams()
    qs.append('station', params.station)
    qs.append('date', params.date)

    const url = `/api/ocean/tides?${qs.toString()}`
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`NOAA proxy error ${res.status}`)
      return await res.json()
    } catch {
      console.warn('NOAA proxy failed, returning empty result.')
      return { predictions: [] }
    }
  }

  async getNasaOceanColor(params: { lat: number; lon: number; startDate?: string; endDate?: string }) {
    const qs = new URLSearchParams()
    qs.append('lat', params.lat.toString())
    qs.append('lon', params.lon.toString())
    if (params.startDate) qs.append('startDate', params.startDate)
    if (params.endDate) qs.append('endDate', params.endDate)

    const url = `/api/ocean/nasa?${qs.toString()}`
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`NASA proxy error ${res.status}`)
      return await res.json()
    } catch {
      console.warn('NASA Ocean Color proxy failed.')
      return null
    }
  }

  async getCopernicusMarine(params: { lat: number; lon: number; startDate?: string; endDate?: string }) {
    const qs = new URLSearchParams()
    qs.append('lat', params.lat.toString())
    qs.append('lon', params.lon.toString())
    if (params.startDate) qs.append('startDate', params.startDate)
    if (params.endDate) qs.append('endDate', params.endDate)

    const url = `/api/ocean/copernicus?${qs.toString()}`
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`Copernicus proxy error ${res.status}`)
      return await res.json()
    } catch {
      console.warn('Copernicus Marine proxy failed.')
      return null
    }
  }

  async searchOceanData(query: string): Promise<any> {
    // Enhanced keyword-based data fetching with multiple sources
    const lowerQuery = query.toLowerCase()
    let result: any = {}

    // Check for location keywords
    const mumbaiKeywords = ['mumbai', 'bombay', 'maharashtra']
    const bayOfBengalKeywords = ['bay of bengal', 'bengal', 'kolkata', 'chennai']
    const arabianSeaKeywords = ['arabian sea', 'arabian', 'mumbai', 'goa']
    const maldivesKeywords = ['maldives', 'maldivian', 'male']

    let lat: number | undefined, lon: number | undefined

    if (mumbaiKeywords.some(k => lowerQuery.includes(k))) {
      lat = 19.07; lon = 72.88
    } else if (bayOfBengalKeywords.some(k => lowerQuery.includes(k))) {
      lat = 15.0; lon = 88.0
    } else if (arabianSeaKeywords.some(k => lowerQuery.includes(k))) {
      lat = 16.0; lon = 68.0
    } else if (maldivesKeywords.some(k => lowerQuery.includes(k))) {
      lat = 4.1755; lon = 73.5093
    }

    // Fetch comprehensive ocean data if location detected
    if (lat && lon) {
      const dataPromises = []

      // ARGO float data
      if (lowerQuery.includes('argo') || lowerQuery.includes('float') || lowerQuery.includes('temperature') || lowerQuery.includes('salinity')) {
        dataPromises.push(
          this.getArgoFloats({ lat, lon, radius: 200 }).then(data => ({ argoData: data })).catch(() => ({}))
        )
      }

      // NASA Ocean Color data
      if (lowerQuery.includes('chlorophyll') || lowerQuery.includes('satellite') || lowerQuery.includes('color') || lowerQuery.includes('productivity')) {
        dataPromises.push(
          this.getNasaOceanColor({ lat, lon }).then(data => ({ nasaData: data })).catch(() => ({}))
        )
      }

      // Copernicus Marine data
      if (lowerQuery.includes('current') || lowerQuery.includes('forecast') || lowerQuery.includes('copernicus') || lowerQuery.includes('european')) {
        dataPromises.push(
          this.getCopernicusMarine({ lat, lon }).then(data => ({ copernicusData: data })).catch(() => ({}))
        )
      }

      // Execute all data fetches in parallel
      const results = await Promise.all(dataPromises)
      results.forEach(data => Object.assign(result, data))
    }

    // Check for tides keywords
    if (lowerQuery.includes('tide') || lowerQuery.includes('tidal')) {
      try {
        // Use a common station ID for demo
        result.tidesData = await this.getNoaaTides({ station: '9414290', date: 'today' })
      } catch {}
    }

    return result
  }
}

export const oceanDataService = new OceanDataService()
