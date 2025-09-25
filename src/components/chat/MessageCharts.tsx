"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp, BarChart3, Download } from 'lucide-react'
import { ChartConfig } from '@/lib/chart-generator'

interface MessageChartsProps {
  charts?: ChartConfig[]
  oceanData?: Record<string, unknown>
}

export function MessageCharts({ charts = [], oceanData }: MessageChartsProps) {
  const [expanded, setExpanded] = useState(false)

  if (!charts.length && !oceanData) return null

  return (
    <Card className="mt-3 bg-[#2a2b32] border-[#3a3b42]">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm text-gray-200 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Ocean Data Visualizations ({charts.length})
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="text-gray-400 hover:text-gray-200"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>
      </CardHeader>
      
      {expanded && (
        <CardContent className="pt-0">
          <div className="space-y-4">
            {charts.map((chart, index) => (
              <div key={index} className="bg-[#1a1b22] rounded-lg p-4 border border-[#3a3b42]">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-200">{chart.title}</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-gray-200"
                    onClick={() => {
                      // Export chart functionality
                      console.log('Export chart:', chart.title)
                    }}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
                
                {/* Simple chart representation - in production, use Chart.js or similar */}
                <div className="bg-[#0f1115] rounded p-4 min-h-[200px] flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <BarChart3 className="w-8 h-8 mx-auto mb-2" />
                    <div className="text-sm">{chart.type.toUpperCase()} Chart</div>
                    <div className="text-xs mt-1">
                      {chart.xAxis.label} vs {chart.yAxis.label}
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      {chart.xAxis.data.length} data points
                    </div>
                  </div>
                </div>
                
                {/* Chart metadata */}
                <div className="mt-2 text-xs text-gray-500">
                  <div>X-Axis: {chart.xAxis.label}</div>
                  <div>Y-Axis: {chart.yAxis.label}</div>
                  {chart.series && <div>Series: {chart.series.length}</div>}
                </div>
              </div>
            ))}
            
            {/* Ocean data summary */}
            {oceanData && (
              <div className="bg-[#1a1b22] rounded-lg p-4 border border-[#3a3b42]">
                <h4 className="text-sm font-medium text-gray-200 mb-2">Data Sources</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {Object.entries(oceanData).map(([key, value]) => (
                    <div key={key} className="text-gray-400">
                      <span className="capitalize">{key}:</span>{' '}
                      <span className="text-gray-300">
                        {Array.isArray(value) ? `${value.length} records` : 'Available'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  )
}
