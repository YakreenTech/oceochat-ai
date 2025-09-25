"use client"
import { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

// Define a more specific type for the ocean data to avoid using 'any'
interface OceanData {
  argoData?: { temperature?: number; salinity?: number }[];
  nasaData?: { data: { chlorophyll_a?: { value: number; units: string }; sea_surface_temperature?: { value: number } } };
  copernicusData?: { data: { ocean_currents?: { speed: number }; sea_surface_height?: { value: number } } };
  tidesData?: { predictions: { t: string; v: string; type: 'H' | 'L' }[] };
}

interface OceanDataVisualizationProps {
  data: OceanData;
}

export function OceanDataVisualization({ data }: OceanDataVisualizationProps) {
  const visualizations = useMemo(() => {
    const components = []

    // ARGO Float Data Visualization
    if (data?.argoData && Array.isArray(data.argoData) && data.argoData.length > 0) {
      components.push(
        <div key="argo" className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            🌊 ARGO Float Data ({data.argoData.length} profiles)
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Temperature Range:</span>
              <div className="text-blue-700 dark:text-blue-300">
                {Math.min(...data.argoData.map((f) => f.temperature || 0)).toFixed(1)}°C - 
                {Math.max(...data.argoData.map((f) => f.temperature || 0)).toFixed(1)}°C
              </div>
            </div>
            <div>
              <span className="font-medium">Salinity Range:</span>
              <div className="text-blue-700 dark:text-blue-300">
                {Math.min(...data.argoData.map((f) => f.salinity || 0)).toFixed(2)} - 
                {Math.max(...data.argoData.map((f) => f.salinity || 0)).toFixed(2)} PSU
              </div>
            </div>
          </div>
          <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
            Data from autonomous ARGO floats providing real-time ocean profiles
          </div>
        </div>
      )
    }

    // NASA Ocean Color Data Visualization
    if (data?.nasaData?.data) {
      const nasaData = data.nasaData.data
      components.push(
        <div key="nasa" className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">
            🛰️ NASA Ocean Color Data
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {nasaData.chlorophyll_a && (
              <div>
                <span className="font-medium">Chlorophyll-a:</span>
                <div className="text-green-700 dark:text-green-300">
                  {nasaData.chlorophyll_a.value.toFixed(2)} {nasaData.chlorophyll_a.units}
                </div>
              </div>
            )}
            {nasaData.sea_surface_temperature && (
              <div>
                <span className="font-medium">SST:</span>
                <div className="text-green-700 dark:text-green-300">
                  {nasaData.sea_surface_temperature.value.toFixed(1)}°C
                </div>
              </div>
            )}
          </div>
          <div className="mt-2 text-xs text-green-600 dark:text-green-400">
            Satellite-derived ocean productivity and temperature measurements
          </div>
        </div>
      )
    }

    // Copernicus Marine Data Visualization
    if (data?.copernicusData?.data) {
      const copData = data.copernicusData.data
      components.push(
        <div key="copernicus" className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
          <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
            🌍 Copernicus Marine Service
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {copData.ocean_currents && (
              <div>
                <span className="font-medium">Current Speed:</span>
                <div className="text-purple-700 dark:text-purple-300">
                  {copData.ocean_currents.speed.toFixed(2)} m/s
                </div>
              </div>
            )}
            {copData.sea_surface_height && (
              <div>
                <span className="font-medium">Sea Level:</span>
                <div className="text-purple-700 dark:text-purple-300">
                  {copData.sea_surface_height.value.toFixed(2)} m
                </div>
              </div>
            )}
          </div>
          <div className="mt-2 text-xs text-purple-600 dark:text-purple-400">
            European marine forecasts and reanalysis data
          </div>
        </div>
      )
    }

    // NOAA Tides Data Visualization with Recharts
    if (data?.tidesData?.predictions && Array.isArray(data.tidesData.predictions)) {
      const chartData = data.tidesData.predictions.map((p) => ({
        time: new Date(p.t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        'Tide (ft)': parseFloat(p.v),
      }));

      components.push(
        <div key="tides" className="mt-4 p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg border border-cyan-200 dark:border-cyan-800">
          <h4 className="font-semibold text-cyan-900 dark:text-cyan-100 mb-2">
            🌊 NOAA Tide Predictions
          </h4>
          <div style={{ width: '100%', height: 200 }}>
            <ResponsiveContainer>
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.3)" />
                <XAxis dataKey="time" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(30,41,59,0.9)', border: '1px solid rgba(128,128,128,0.3)' }}
                  labelStyle={{ color: '#cbd5e1' }}
                />
                <Legend wrapperStyle={{ fontSize: '14px' }} />
                <Line type="monotone" dataKey="Tide (ft)" stroke="#0891b2" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 text-xs text-cyan-600 dark:text-cyan-400">
            Real-time tide predictions from NOAA stations, visualized as a time-series chart.
          </div>
        </div>
      )
    }

    return components
  }, [data])

  if (visualizations.length === 0) {
    return null
  }

  return (
    <div className="ocean-data-visualizations">
      {visualizations}
      <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="text-xs text-gray-600 dark:text-gray-400 text-center">
          📊 Research-grade ocean data from multiple authoritative sources
        </div>
      </div>
    </div>
  )
}
