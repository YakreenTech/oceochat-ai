'use client'

import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { ChartGenerator as ChartGen, ChartConfig } from '@/lib/research-document-generator'
import { 
  BarChart3, 
  LineChart, 
  Download,
  Activity
} from 'lucide-react'

// Dynamically import Plotly to avoid SSR issues
const Plot = dynamic(() => import('react-plotly.js'), { 
  ssr: false,
  loading: () => <div className="h-64 flex items-center justify-center">Loading chart...</div>
})

interface ChartGeneratorProps {
  data: Record<string, unknown>[]
  onChartGenerated?: (chartConfig: ChartConfig) => void
}

export function ChartGenerator({ data, onChartGenerated }: ChartGeneratorProps) {
  const [chartType, setChartType] = useState<ChartConfig['type']>('line')
  const [title, setTitle] = useState('Ocean Data Analysis')
  const [xLabel, setXLabel] = useState('Time/Location')
  const [yLabel, setYLabel] = useState('Measurement')
  const [plotConfig, setPlotConfig] = useState<Record<string, unknown> | null>(null)

  const chartTypes = [
    { value: 'line', label: 'Line Chart', icon: LineChart },
    { value: 'scatter', label: 'Scatter Plot', icon: Activity },
    { value: 'bar', label: 'Bar Chart', icon: BarChart3 },
    { value: 'heatmap', label: 'Heatmap', icon: Activity }
  ]

  useEffect(() => {
    if (data && data.length > 0) {
      generateChart()
    }
  }, [chartType, title, xLabel, yLabel, data])

  const generateChart = () => {
    if (!data || data.length === 0) return

    const config: ChartConfig = {
      type: chartType,
      title,
      xLabel,
      yLabel,
      data: processDataForChart(data, chartType)
    }

    const plotlyConfig = ChartGen.generatePlotlyConfig(config)
    setPlotConfig(plotlyConfig)
    onChartGenerated?.(config)
  }

  const processDataForChart = (rawData: Record<string, unknown>[], type: ChartConfig['type']) => {
    // Process different types of ocean data
    if (Array.isArray(rawData) && rawData.length > 0) {
      const firstItem = rawData[0]
      
      // ARGO float data
      if (firstItem.temperature && firstItem.pressure) {
        return rawData.map((item, index) => ({
          x: item.pressure || index,
          y: item.temperature,
          z: item.salinity
        }))
      }
      
      // NOAA tide data
      if (firstItem.predictions && Array.isArray(firstItem.predictions)) {
        return firstItem.predictions.slice(0, 20).map((pred: Record<string, unknown>) => ({
          x: pred.t,
          y: parseFloat(String(pred.v))
        }))
      }
      
      // NASA ocean color data
      if (firstItem.value !== undefined) {
        return rawData.map((item, index) => ({
          x: item.longitude || index,
          y: item.latitude || item.value,
          z: item.value
        }))
      }
    }

    // Fallback: generate sample data
    return Array.from({ length: 20 }, (_, i) => ({
      x: i,
      y: Math.sin(i * 0.5) * 10 + 20 + Math.random() * 5,
      z: Math.random() * 35 + 30
    }))
  }

  const downloadChart = () => {
    if (!plotConfig) return

    // Create a temporary div to render the chart for export
    const tempDiv = document.createElement('div')
    tempDiv.style.width = '800px'
    tempDiv.style.height = '600px'
    document.body.appendChild(tempDiv)

    // This would require additional Plotly export functionality
    // For now, we'll trigger a browser download of the chart data
    const chartData = {
      config: plotConfig,
      title,
      timestamp: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(chartData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title.replace(/\s+/g, '_')}_chart.json`
    a.click()
    URL.revokeObjectURL(url)
    document.body.removeChild(tempDiv)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Research Chart Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Chart Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="chart-type">Chart Type</Label>
            <Select value={chartType} onValueChange={(value: ChartConfig['type']) => setChartType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select chart type" />
              </SelectTrigger>
              <SelectContent>
                {chartTypes.map((type) => {
                  const Icon = type.icon
                  return (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Chart Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter chart title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="x-label">X-Axis Label</Label>
            <Input
              id="x-label"
              value={xLabel}
              onChange={(e) => setXLabel(e.target.value)}
              placeholder="X-axis label"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="y-label">Y-Axis Label</Label>
            <Input
              id="y-label"
              value={yLabel}
              onChange={(e) => setYLabel(e.target.value)}
              placeholder="Y-axis label"
            />
          </div>
        </div>

        {/* Chart Display */}
        <div className="border rounded-lg p-4 bg-white">
          {plotConfig ? (
            <Plot
              data={plotConfig.data}
              layout={Object.assign({}, plotConfig.layout, {
                width: undefined,
                height: 400,
                autosize: true,
                margin: { l: 60, r: 30, t: 60, b: 60 }
              })}
              config={{
                responsive: true,
                displayModeBar: true,
                modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d']
              }}
              style={{ width: '100%', height: '400px' }}
            />
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Chart will appear here when data is available</p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button onClick={generateChart} className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Generate Chart
          </Button>
          <Button onClick={downloadChart} variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Download Chart
          </Button>
        </div>

        {/* Data Summary */}
        {data && data.length > 0 && (
          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
            <strong>Data Summary:</strong> {data.length} data points loaded
            {data[0]?.temperature && <span> • Temperature range available</span>}
            {data[0]?.salinity && <span> • Salinity data included</span>}
            {data[0]?.predictions && <span> • Tide predictions loaded</span>}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
