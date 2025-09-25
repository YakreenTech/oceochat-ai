export class OceanDataService {
  private argoBaseUrl = 'https://erddap.marine.rutgers.edu/erddap/tabledap'
  private noaaTidesUrl = 'https://api.tidesandcurrents.noaa.gov/api/prod/datagetter'
  private noaaCurrentsUrl = 'https://opendap.co-ops.nos.noaa.gov/dods'
  private nasaOceanColorUrl = 'https://oceandata.sci.gsfc.nasa.gov/api'
  private copernicusUrl = 'https://data.marine.copernicus.eu/api'

  private cache: Map<string, { data: any; timestamp: number }> = new Map()
  private readonly CACHE_DURATION = 30 * 60 * 1000 // 30 minutes

  async getArgoFloats(params: {
    lat?: number
    lon?: number
    radius?: number
    startDate?: string
    endDate?: string
    depth?: number
  }): Promise<any> {
    const cacheKey = `argo_${JSON.stringify(params)}`

    // Check cache first
    const cached = this.cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data
    }

    try {
      const queryParams = new URLSearchParams({
        'longitude,latitude,time,pressure,temperature,psal': '1',
        'time>=': params.startDate || '2020-01-01T00:00:00Z',
        'time<=': params.endDate || new Date().toISOString(),
      })

      if (params.lat && params.lon && params.radius) {
        queryParams.append('latitude>=' , (params.lat - params.radius / 111).toString())
        queryParams.append('latitude<=' , (params.lat + params.radius / 111).toString())
        queryParams.append('longitude>=' , (params.lon - params.radius / 111).toString())
        queryParams.append('longitude<=' , (params.lon + params.radius / 111).toString())
      }

      const response = await fetch(
        `${this.argoBaseUrl}/ArgoFloats?${queryParams}`,
        {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'OceoChat/1.0'
          }
        }
      )

      if (!response.ok) {
        throw new Error(`ARGO API error: ${response.statusText}`)
      }

      const data = await response.json()

      // Process and structure the data
      const processedData = this.processArgoData(data)

      // Cache the result
      this.cache.set(cacheKey, { data: processedData, timestamp: Date.now() })

      return processedData
    } catch (error) {
      console.error('ARGO API Error:', error)
      throw new Error('Failed to fetch ARGO float data')
    }
  }

  async getNOAATides(station: string, params: {
    begin_date: string
    end_date?: string
    product: string
  }): Promise<any> {
    const cacheKey = `noaa_tides_${station}_${params.begin_date}`

    const cached = this.cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data
    }

    try {
      const queryParams = new URLSearchParams({
        station,
        product: params.product,
        begin_date: params.begin_date,
        end_date: params.end_date || new Date().toISOString().split('T')[0],
        datum: 'MLLW',
        time_zone: 'lst_ldt',
        units: 'metric',
        format: 'json'
      })

      const response = await fetch(
        `${this.noaaTidesUrl}?${queryParams}`,
        {
          headers: {
            'User-Agent': 'OceoChat/1.0'
          }
        }
      )

      if (!response.ok) {
        throw new Error(`NOAA Tides API error: ${response.statusText}`)
      }

      const data = await response.json()
      const processedData = this.processTideData(data)

      this.cache.set(cacheKey, { data: processedData, timestamp: Date.now() })

      return processedData
    } catch (error) {
      console.error('NOAA Tides API Error:', error)
      throw new Error('Failed to fetch tide data')
    }
  }

  async getNASAOceanColor(params: {
    lat: number
    lon: number
    startDate: string
    endDate: string
    product: string
  }): Promise<any> {
    const cacheKey = `nasa_${JSON.stringify(params)}`

    const cached = this.cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data
    }

    try {
      const queryParams = new URLSearchParams({
        lat: params.lat.toString(),
        lon: params.lon.toString(),
        start: params.startDate,
        end: params.endDate,
        product: params.product,
        format: 'json'
      })

      const response = await fetch(
        `${this.nasaOceanColorUrl}/satellite?${queryParams}`,
        {
          headers: {
            'User-Agent': 'OceoChat/1.0'
          }
        }
      )

      if (!response.ok) {
        throw new Error(`NASA Ocean Color API error: ${response.statusText}`)
      }

      const data = await response.json()
      const processedData = this.processSatelliteData(data)

      this.cache.set(cacheKey, { data: processedData, timestamp: Date.now() })

      return processedData
    } catch (error) {
      console.error('NASA Ocean Color API Error:', error)
      throw new Error('Failed to fetch satellite data')
    }
  }

  async searchOceanData(query: string): Promise<any> {
    // Parse the natural language query to determine what data to fetch
    const searchParams = this.parseQuery(query)

    const promises: Promise<any>[] = []

    // Fetch relevant data based on query analysis
    if (searchParams.needsArgoData) {
      promises.push(this.getArgoFloats(searchParams.argoParams))
    }

    if (searchParams.needsTideData) {
      promises.push(this.getNOAATides(searchParams.tideStation, {
        begin_date: searchParams.startDate,
        product: 'predictions'
      }))
    }

    if (searchParams.needsSatelliteData) {
      promises.push(this.getNASAOceanColor({
        lat: searchParams.lat,
        lon: searchParams.lon,
        startDate: searchParams.startDate,
        endDate: searchParams.endDate,
        product: 'chlor_a'
      }))
    }

    try {
      const results = await Promise.allSettled(promises)

      return {
        query,
        results: results.map((result, index) =>
          result.status === 'fulfilled' ? result.value : null
        ),
        timestamp: new Date().toISOString(),
        searchType: searchParams.type
      }
    } catch (error) {
      console.error('Ocean data search error:', error)
      throw new Error('Failed to search ocean data')
    }
  }

  private parseQuery(query: string): any {
    const keywords = {
      temperature: ['temperature', 'temp', 'thermal', 'heat'],
      salinity: ['salinity', 'salt', 'psu', 'conductivity'],
      tides: ['tide', 'tidal', 'water level', 'sea level'],
      currents: ['current', 'flow', 'velocity', 'speed'],
      chlorophyll: ['chlorophyll', 'productivity', 'algae', 'bloom'],
      argo: ['argo', 'float', 'profile', 'depth']
    }

    const location = this.extractLocation(query)
    const timeRange = this.extractTimeRange(query)

    return {
      type: 'comprehensive',
      lat: location.lat,
      lon: location.lon,
      startDate: timeRange.start || '2020-01-01',
      endDate: timeRange.end || new Date().toISOString().split('T')[0],
      needsArgoData: this.containsKeywords(query, keywords.argo),
      needsTideData: this.containsKeywords(query, keywords.tides),
      needsSatelliteData: this.containsKeywords(query, keywords.chlorophyll),
      argoParams: {
        lat: location.lat,
        lon: location.lon,
        startDate: timeRange.start,
        endDate: timeRange.end
      },
      tideStation: this.findNearestTideStation(location.lat, location.lon)
    }
  }

  private extractLocation(query: string): { lat: number; lon: number } {
    // Enhanced location extraction for Indian Ocean and global locations
    const locations: Record<string, { lat: number; lon: number }> = {
      'mumbai': { lat: 18.9220, lon: 72.8347 },
      'bombay': { lat: 18.9220, lon: 72.8347 },
      'chennai': { lat: 13.0827, lon: 80.2707 },
      'kolkata': { lat: 22.5726, lon: 88.3639 },
      'delhi': { lat: 28.7041, lon: 77.1025 },
      'bengaluru': { lat: 12.9716, lon: 77.5946 },
      'hyderabad': { lat: 17.3850, lon: 78.4867 },
      'pune': { lat: 18.5204, lon: 73.8567 },
      'ahmedabad': { lat: 23.0225, lon: 72.5714 },
      'surat': { lat: 21.1702, lon: 72.8311 },
      'bay of bengal': { lat: 15, lon: 90 },
      'arabian sea': { lat: 20, lon: 65 },
      'indian ocean': { lat: -5, lon: 80 },
      'gulf of mannar': { lat: 8.5, lon: 79.0 },
      'lakshadweep': { lat: 10.5, lon: 72.6 },
      'andaman': { lat: 12, lon: 93 },
      'nicobar': { lat: 7, lon: 93.8 }
    }

    const queryLower = query.toLowerCase()

    for (const [location, coords] of Object.entries(locations)) {
      if (queryLower.includes(location)) {
        return coords
      }
    }

    // Default to Indian Ocean if no specific location found
    return { lat: 0, lon: 80 }
  }

  private extractTimeRange(query: string): { start?: string; end?: string } {
    const now = new Date()
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    if (query.includes('last month') || query.includes('past month')) {
      return { start: oneMonthAgo.toISOString().split('T')[0] }
    }

    if (query.includes('last year') || query.includes('past year')) {
      const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
      return { start: oneYearAgo.toISOString().split('T')[0] }
    }

    if (query.includes('week') || query.includes('7 days')) {
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      return { start: oneWeekAgo.toISOString().split('T')[0] }
    }

    return { start: oneMonthAgo.toISOString().split('T')[0] }
  }

  private containsKeywords(query: string, keywords: string[]): boolean {
    return keywords.some(keyword => query.toLowerCase().includes(keyword))
  }

  private findNearestTideStation(lat: number, lon: number): string {
    // Major Indian tide stations
    const stations: Record<string, { lat: number; lon: number; stationId: string }> = {
      'Mumbai': { lat: 18.9220, lon: 72.8347, stationId: '9411340' },
      'Chennai': { lat: 13.0827, lon: 80.2707, stationId: '8762483' },
      'Kolkata': { lat: 22.5726, lon: 88.3639, stationId: '8761724' },
      'Kochi': { lat: 9.9312, lon: 76.2673, stationId: '8761889' },
      'Visakhapatnam': { lat: 17.6868, lon: 83.2185, stationId: '8762483' }
    }

    let nearest = '9411340' // Default to Mumbai
    let minDistance = Infinity

    for (const station of Object.values(stations)) {
      const distance = Math.sqrt(
        Math.pow(lat - station.lat, 2) + Math.pow(lon - station.lon, 2)
      )

      if (distance < minDistance) {
        minDistance = distance
        nearest = station.stationId
      }
    }

    return nearest
  }

  private processArgoData(data: any): any {
    // Process raw ARGO data into structured format
    return {
      floats: data.tableRows?.map((row: any) => ({
        id: row[0],
        lon: row[1],
        lat: row[2],
        time: row[3],
        pressure: row[4],
        temperature: row[5],
        salinity: row[6]
      })) || [],
      metadata: {
        totalFloats: data.tableRows?.length || 0,
        timeRange: {
          start: data.tableRows?.[0]?.[3],
          end: data.tableRows?.[data.tableRows.length - 1]?.[3]
        },
        parameters: ['temperature', 'salinity', 'pressure']
      }
    }
  }

  private processTideData(data: any): any {
    return {
      tides: data.data?.map((tide: any) => ({
        time: tide.t,
        height: tide.v,
        type: tide.v > 0 ? 'high' : 'low'
      })) || [],
      metadata: {
        station: data.metadata?.id,
        units: 'meters',
        datum: 'MLLW'
      }
    }
  }

  private processSatelliteData(data: any): any {
    return {
      satellite: {
        chlorophyll: data.chlor_a,
        temperature: data.sst,
        date: data.time,
        quality: data.quality_flag
      },
      metadata: {
        sensor: data.sensor,
        resolution: '1km',
        algorithm: data.algorithm
      }
    }
  }

  // Get comprehensive ocean knowledge for AI context
  getOceanKnowledge(): Record<string, any> {
    return {
      oceanBasins: {
        indian: {
          area: '73.4 million km²',
          averageDepth: '3741m',
          features: ['Indian Ocean Dipole', 'Arabian Sea', 'Bay of Bengal'],
          currents: ['Somali Current', 'Agulhas Current', 'Leeuwen Current'],
          climate: 'Monsoon-dominated, warm throughout year'
        },
        pacific: {
          area: '165.2 million km²',
          averageDepth: '4028m',
          features: ['Pacific Ring of Fire', 'Great Pacific Garbage Patch'],
          currents: ['Kuroshio Current', 'California Current', 'North Equatorial Current']
        },
        atlantic: {
          area: '85.1 million km²',
          averageDepth: '3646m',
          features: ['Mid-Atlantic Ridge', 'Sargasso Sea'],
          currents: ['Gulf Stream', 'North Atlantic Drift', 'Labrador Current']
        }
      },
      marineEcosystems: {
        coralReefs: {
          types: ['Fringing', 'Barrier', 'Atoll'],
          biodiversity: 'Highest marine biodiversity',
          threats: ['Bleaching', 'Ocean acidification', 'Overfishing'],
          indianOcean: ['Lakshadweep', 'Andaman', 'Great Barrier Reef']
        },
        mangroves: {
          importance: 'Coastal protection, carbon sequestration, biodiversity',
          indianCoast: ['Sundarbans', 'Pichavaram', 'Bhitar Kanika'],
          threats: ['Development', 'Pollution', 'Sea level rise']
        },
        seagrass: {
          role: 'Primary production, sediment stabilization',
          global: '0.1-0.2% ocean area, 10-18% marine carbon burial'
        }
      },
      climatePhenomena: {
        indianOceanDipole: {
          phases: ['Positive', 'Negative', 'Neutral'],
          impacts: 'Monsoon rainfall, cyclone formation, fisheries',
          monitoring: 'Sea surface temperature gradient'
        },
        enso: {
          elNino: 'Warm phase, weak monsoons, drought conditions',
          laNina: 'Cool phase, strong monsoons, flooding risk',
          monitoring: 'Pacific SST anomalies'
        },
        monsoon: {
          southwest: 'June-September, Arabian Sea and Bay of Bengal',
          northeast: 'October-December, Bay of Bengal',
          impacts: 'Agriculture, water resources, economy'
        }
      }
    }
  }
}

export const oceanDataService = new OceanDataService()
