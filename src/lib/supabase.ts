import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './supabase-types'

export const supabase = (() => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase environment variables not found')
    return null
  }
  
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
})()
