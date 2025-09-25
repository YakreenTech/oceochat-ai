import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import type { Database } from './supabase-types'

// Create a Supabase server client using Next.js cookies helper.
// @supabase/ssr expects getAll/setAll on the cookies adapter in App Router.
export async function getSupabaseServer() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseAnonKey) return null

  const cookieStore = await cookies()

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        } catch {
          // If cookies are not mutable in this context (e.g., certain RSC flows), ignore.
        }
      },
    },
  })
}
