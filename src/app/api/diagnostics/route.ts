import { NextResponse } from 'next/server'
import { getModelSelector } from '@/lib/gemini-model-selector'
import { testOceanAPIs } from '@/lib/ocean-apis'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const geminiKeyPresent = !!process.env.GEMINI_API_KEY
    const argoBase = process.env.ARGO_API_BASE || 'https://argovis.colorado.edu/api/v1/'
    const noaaBase = process.env.NOAA_TIDES_API || 'https://api.tidesandcurrents.noaa.gov/api/prod/datagetter'
    const nasaBase = process.env.NASA_OCEAN_API || 'https://oceandata.sci.gsfc.nasa.gov/api/v2/'

    const modelSelector = getModelSelector()

    const [modelInfo, oceanStatus] = await Promise.all([
      (async () => {
        if (!modelSelector) return { configured: false }
        try {
          const [currentModelName, modelStatus] = await Promise.all([
            modelSelector.getCurrentModelName(),
            modelSelector.getModelStatus(),
          ])
          return {
            configured: true,
            currentModel: currentModelName,
            availableModels: modelStatus,
          }
        } catch (e) {
          return { configured: true, error: (e as Error).message }
        }
      })(),
      testOceanAPIs(),
    ])

    return NextResponse.json({
      env: {
        GEMINI_API_KEY: geminiKeyPresent ? 'present' : 'missing',
        ARGO_API_BASE: argoBase,
        NOAA_TIDES_API: noaaBase,
        NASA_OCEAN_API: nasaBase,
      },
      gemini: modelInfo,
      oceanApis: oceanStatus,
      timestamp: new Date().toISOString(),
    })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
