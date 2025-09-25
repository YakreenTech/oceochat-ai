import { ArgoFloat, NOAAData, NASAOceanColor, CopernicusData } from './ocean-apis'

export interface ChartConfig {
  type: 'line' | 'scatter' | 'heatmap' | 'bar' | 'area'
  title: string
  xAxis: {
    label: string
    data: (string | number)[]
  }
  yAxis: {
    label: string
    data: number[]
  }
  series?: {
    name: string
    data: number[]
    color?: string
  }[]
}

export class ChartGenerator {
  // Generate temperature profile chart from ARGO data
  static generateTemperatureProfile(argoData: ArgoFloat[]): ChartConfig {
    const float = argoData[0]
    return {
      type: 'line',
      title: `Temperature Profile - Float ${float.platform_number}`,
      xAxis: {
        label: 'Temperature (°C)',
        data: float.temperature
      },
      yAxis: {
        label: 'Pressure (dbar)',
        data: float.pressure
      }
    }
  }

  // Generate salinity vs temperature scatter plot
  static generateTSPlot(argoData: ArgoFloat[]): ChartConfig {
    const float = argoData[0]
    return {
      type: 'scatter',
      title: `T-S Diagram - Float ${float.platform_number}`,
      xAxis: {
        label: 'Salinity (PSU)',
        data: float.salinity
      },
      yAxis: {
        label: 'Temperature (°C)',
        data: float.temperature
      }
    }
  }

  // Generate tidal prediction chart
  static generateTidalChart(noaaData: NOAAData): ChartConfig {
    const times = noaaData.predictions.map(p => p.t)
    const values = noaaData.predictions.map(p => parseFloat(p.v))
    
    return {
      type: 'line',
      title: `Tidal Predictions - Station ${noaaData.station}`,
      xAxis: {
        label: 'Time',
        data: times
      },
      yAxis: {
        label: 'Water Level (m)',
        data: values
      }
    }
  }

  // Generate chlorophyll concentration map
  static generateChlorophyllMap(nasaData: NASAOceanColor[]): ChartConfig {
    const lats = nasaData.map(d => d.latitude)
    const lons = nasaData.map(d => d.longitude)
    const values = nasaData.map(d => d.value)

    return {
      type: 'heatmap',
      title: 'Chlorophyll-a Concentration',
      xAxis: {
        label: 'Longitude',
        data: lons
      },
      yAxis: {
        label: 'Latitude',
        data: lats
      },
      series: [{
        name: 'Chlorophyll-a (mg/m³)',
        data: values,
        color: '#00ff00'
      }]
    }
  }

  // Generate ocean current vectors
  static generateCurrentVectors(copernicusData: CopernicusData[]): ChartConfig {
    const lats = copernicusData.map(d => d.latitude)
    const lons = copernicusData.map(d => d.longitude)
    const speeds = copernicusData.map(d => 
      Math.sqrt((d.ocean_current_u || 0) ** 2 + (d.ocean_current_v || 0) ** 2)
    )

    return {
      type: 'scatter',
      title: 'Ocean Current Speed',
      xAxis: {
        label: 'Longitude',
        data: lons
      },
      yAxis: {
        label: 'Latitude',
        data: lats
      },
      series: [{
        name: 'Current Speed (m/s)',
        data: speeds,
        color: '#0066cc'
      }]
    }
  }

  // Generate multi-parameter comparison
  static generateMultiParameterChart(data: {
    temperature?: number[]
    salinity?: number[]
    chlorophyll?: number[]
    depth?: number[]
  }): ChartConfig {
    const series = []
    const depth = data.depth || []

    if (data.temperature) {
      series.push({
        name: 'Temperature (°C)',
        data: data.temperature,
        color: '#ff4444'
      })
    }

    if (data.salinity) {
      series.push({
        name: 'Salinity (PSU)',
        data: data.salinity,
        color: '#4444ff'
      })
    }

    if (data.chlorophyll) {
      series.push({
        name: 'Chlorophyll-a (mg/m³)',
        data: data.chlorophyll,
        color: '#44ff44'
      })
    }

    return {
      type: 'line',
      title: 'Multi-Parameter Ocean Profile',
      xAxis: {
        label: 'Depth (m)',
        data: depth
      },
      yAxis: {
        label: 'Parameter Values',
        data: depth
      },
      series
    }
  }

  // Export chart as image data URL
  static async exportChartAsImage(chartConfig: ChartConfig): Promise<string> {
    // This would integrate with a charting library like Chart.js or D3
    // For now, return a placeholder
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
  }

  // Generate chart configuration for research document
  static generateResearchCharts(oceanData: {
    argo?: ArgoFloat[]
    noaa?: NOAAData
    nasa?: NASAOceanColor[]
    copernicus?: CopernicusData[]
  }): ChartConfig[] {
    const charts: ChartConfig[] = []

    if (oceanData.argo && oceanData.argo.length > 0) {
      charts.push(this.generateTemperatureProfile(oceanData.argo))
      charts.push(this.generateTSPlot(oceanData.argo))
    }

    if (oceanData.noaa) {
      charts.push(this.generateTidalChart(oceanData.noaa))
    }

    if (oceanData.nasa && oceanData.nasa.length > 0) {
      charts.push(this.generateChlorophyllMap(oceanData.nasa))
    }

    if (oceanData.copernicus && oceanData.copernicus.length > 0) {
      charts.push(this.generateCurrentVectors(oceanData.copernicus))
    }

    return charts
  }
}
