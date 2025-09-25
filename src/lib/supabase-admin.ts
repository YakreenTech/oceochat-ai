import { createClient } from '@supabase/supabase-js'
import type { Database } from './supabase-types'

// Admin client for server-side operations that bypass RLS
export const supabaseAdmin = (() => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn('Supabase admin credentials not found')
    return null
  }
  
  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
})()

// Ocean data cache management functions
export class OceanDataCacheManager {
  static async getCachedData(queryHash: string) {
    if (!supabaseAdmin) return null
    
    const { data, error } = await supabaseAdmin
      .from('ocean_data_cache')
      .select('*')
      .eq('query_hash', queryHash)
      .gt('expires_at', new Date().toISOString())
      .single()
    
    if (error || !data) return null
    
    // Increment access count
    await supabaseAdmin.rpc('increment_cache_access', { cache_id: data.id })
    
    return data
  }
  
  static async setCachedData(
    queryHash: string,
    queryParams: any,
    dataSource: 'argo' | 'noaa' | 'nasa' | 'copernicus' | 'incois',
    data: any,
    expiresInHours: number = 24
  ) {
    if (!supabaseAdmin) return null
    
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + expiresInHours)
    
    const { data: cached, error } = await supabaseAdmin
      .from('ocean_data_cache')
      .upsert({
        query_hash: queryHash,
        query_params: queryParams,
        data_source: dataSource,
        data: data,
        expires_at: expiresAt.toISOString(),
        quality_score: 1.0
      })
      .select()
      .single()
    
    if (error) {
      console.error('Failed to cache ocean data:', error)
      return null
    }
    
    return cached
  }
  
  static async cleanupExpiredCache() {
    if (!supabaseAdmin) return
    
    await supabaseAdmin.rpc('cleanup_expired_cache')
  }
  
  static async getDataStats() {
    if (!supabaseAdmin) return null
    
    const { data, error } = await supabaseAdmin.rpc('get_ocean_data_stats')
    
    if (error) {
      console.error('Failed to get ocean data stats:', error)
      return null
    }
    
    return data
  }
}

// User management functions
export class UserManager {
  static async getUserProfile(userId: string) {
    if (!supabaseAdmin) return null
    
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) {
      console.error('Failed to get user profile:', error)
      return null
    }
    
    return data
  }
  
  static async updateUserProfile(userId: string, updates: Partial<Database['public']['Tables']['users']['Update']>) {
    if (!supabaseAdmin) return null
    
    const { data, error } = await supabaseAdmin
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    
    if (error) {
      console.error('Failed to update user profile:', error)
      return null
    }
    
    return data
  }
  
  static async getUserActivitySummary(userId: string) {
    if (!supabaseAdmin) return null
    
    const { data, error } = await supabaseAdmin.rpc('get_user_activity_summary', { user_uuid: userId })
    
    if (error) {
      console.error('Failed to get user activity summary:', error)
      return null
    }
    
    return data
  }
}

// Research project management
export class ResearchProjectManager {
  static async createProject(userId: string, projectData: Database['public']['Tables']['research_projects']['Insert']) {
    if (!supabaseAdmin) return null
    
    const { data, error } = await supabaseAdmin
      .from('research_projects')
      .insert({ ...projectData, user_id: userId })
      .select()
      .single()
    
    if (error) {
      console.error('Failed to create research project:', error)
      return null
    }
    
    return data
  }
  
  static async addTeamMember(projectId: string, userId: string, role: 'admin' | 'researcher' | 'member' | 'viewer', invitedBy: string) {
    if (!supabaseAdmin) return null
    
    const { data, error } = await supabaseAdmin
      .from('team_memberships')
      .insert({
        project_id: projectId,
        user_id: userId,
        role: role,
        invited_by: invitedBy
      })
      .select()
      .single()
    
    if (error) {
      console.error('Failed to add team member:', error)
      return null
    }
    
    return data
  }
}
