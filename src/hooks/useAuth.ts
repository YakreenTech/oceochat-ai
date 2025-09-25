"use client"
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export function useAuth() {
  const [isLoading, setIsLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    let unsub: (() => void) | undefined
    const init = async () => {
      if (!supabase) {
        setIsLoading(false)
        return
      }
      const { data } = await supabase.auth.getUser()
      setUserId(data.user?.id ?? null)
      const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
        setUserId(session?.user?.id ?? null)
      })
      unsub = () => sub.subscription.unsubscribe()
      setIsLoading(false)
    }
    init()
    return () => { if (unsub) unsub() }
  }, [])

  return { isLoading, userId, isAuthenticated: !!userId }
}
