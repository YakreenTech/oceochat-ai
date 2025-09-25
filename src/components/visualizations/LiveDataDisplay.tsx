'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  BarChart3, 
  Map, 
  Table, 
  TrendingUp, 
  Waves, 
  Thermometer,
  Droplets,
  Navigation,
  Download,
  Maximize2
} from 'lucide-react'

interface LiveDataDisplayProps {
  visualizations?: any[]
  tables?: any[]
  maps?: any[]
  title?: string
}

export function LiveDataDisplay({ 
  visualizations = [], 
  tables = [], 
  maps = [],
  title = "Ocean Data Analysis"
}: LiveDataDisplayProps) {
  const [activeTab, setActiveTab] = useState('charts')
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Mock real-time data updates
  const [liveData, setLiveData] = useState({
    temperature: 28.5,
    salinity: 35.2,
    currentSpeed: 0.8,
    lastUpdate: new Date()
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveData(prev => ({
        temperature: prev.temperature + (Math.random() - 0.5) * 0.2,
        salinity: prev.salinity + (Math.random() - 0.5) * 0.1,
        currentSpeed: Math.max(0, prev.currentSpeed + (Math.random() - 0.5) * 0.1),
        lastUpdate: new Date()
      }))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const renderChart = (viz: any) => {
    return (
      <Card key={viz.type} className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-500" />
            {viz.title}
          </CardTitle>
          <CardDescription>{viz.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg flex items-center justify-center border-2 border-dashed border-blue-200 dark:border-blue-700">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-blue-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Interactive {viz.chartType} chart
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {viz.data?.length || 0} data points
              </p>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button size="sm" variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button size="sm" variant="outline">
              <Maximize2 className="w-4 h-4 mr-2" />
              Fullscreen
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderTable = (table: any) => {
    return (
      <Card key={table.title} className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Table className="w-5 h-5 text-green-500" />
            {table.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  {table.headers?.map((header: string, index: number) => (
                    <th key={index} className="text-left p-2 font-medium text-gray-700 dark:text-gray-300">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.rows?.slice(0, 5).map((row: any[], rowIndex: number) => (
                  <tr key={rowIndex} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} className="p-2 text-sm">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {table.rows?.length > 5 && (
            <p className="text-xs text-gray-500 mt-2">
              Showing 5 of {table.rows.length} rows
            </p>
          )}
        </CardContent>
      </Card>
    )
  }

  const renderMap = (map: any) => {
    return (
      <Card key={map.type} className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Map className="w-5 h-5 text-purple-500" />
            {map.title}
          </CardTitle>
          <CardDescription>{map.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 bg-gradient-to-br from-blue-100 to-green-100 dark:from-blue-900/30 dark:to-green-900/30 rounded-lg flex items-center justify-center border-2 border-dashed border-purple-200 dark:border-purple-700 relative overflow-hidden">
            {/* Mock map background */}
            <div className="absolute inset-0 opacity-20">
              <div className="w-full h-full bg-gradient-to-br from-blue-400 via-cyan-400 to-green-400"></div>
            </div>
            
            {/* Map markers */}
            <div className="relative z-10 text-center">
              <Map className="w-12 h-12 text-purple-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Interactive Ocean Map
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Center: {map.center?.lat?.toFixed(4)}°N, {map.center?.lon?.toFixed(4)}°E
              </p>
              <div className="flex gap-2 mt-3 justify-center">
                {map.layers?.map((layer: any, index: number) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {layer.name}
                  </Badge>
                ))}
              </div>
            </div>
            
            {/* Mock data points */}
            <div className="absolute top-1/4 left-1/3 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            <div className="absolute top-1/2 right-1/3 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <div className="absolute bottom-1/3 left-1/2 w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderLiveMetrics = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                <Thermometer className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Temperature</p>
                <p className="text-xl font-bold">{liveData.temperature.toFixed(1)}°C</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Droplets className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Salinity</p>
                <p className="text-xl font-bold">{liveData.salinity.toFixed(1)} PSU</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <Navigation className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Current Speed</p>
                <p className="text-xl font-bold">{liveData.currentSpeed.toFixed(1)} m/s</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (visualizations.length === 0 && tables.length === 0 && maps.length === 0) {
    return null
  }

  return (
    <div className="w-full space-y-4">
      {/* Live Metrics */}
      {renderLiveMetrics()}
      
      {/* Main Data Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Waves className="w-5 h-5 text-blue-500" />
            {title}
          </CardTitle>
          <CardDescription>
            Live oceanographic data visualization and analysis
            <Badge variant="secondary" className="ml-2">
              Updated {liveData.lastUpdate.toLocaleTimeString()}
            </Badge>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="charts" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Charts ({visualizations.length})
              </TabsTrigger>
              <TabsTrigger value="tables" className="flex items-center gap-2">
                <Table className="w-4 h-4" />
                Tables ({tables.length})
              </TabsTrigger>
              <TabsTrigger value="maps" className="flex items-center gap-2">
                <Map className="w-4 h-4" />
                Maps ({maps.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="charts" className="space-y-4 mt-4">
              {visualizations.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {visualizations.map(renderChart)}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No charts available for this query</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="tables" className="space-y-4 mt-4">
              {tables.length > 0 ? (
                <div className="space-y-4">
                  {tables.map(renderTable)}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Table className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No tables available for this query</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="maps" className="space-y-4 mt-4">
              {maps.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {maps.map(renderMap)}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Map className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No maps available for this query</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
