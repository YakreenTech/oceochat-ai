export type Role = 'user' | 'assistant'

export interface Message {
  id: string
  role: Role
  content: string
  created_at: string
  metadata?: Record<string, unknown>
  userId?: string
}

export interface Conversation {
  id: string
  title: string
  created_at: string
}

export interface OceanDataResult {
  location?: { lat: number; lon: number; name?: string }
  timeRange?: { start: string; end: string }
  temperature?: number[]
  salinity?: number[]
  depthLevels?: number[]
  dataSources?: string[]
}
