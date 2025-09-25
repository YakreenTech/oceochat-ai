 "use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface UserProfile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  daily_chat_limit: number
  chats_used_today: number
  last_chat_reset: string
  preferences: {
    theme: 'light' | 'dark'
    language: string
    notifications: boolean
  }
}

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error?: string; success?: boolean; message?: string }>
  signIn: (email: string, password: string) => Promise<{ error?: string; success?: boolean; message?: string }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>
  canChat: () => boolean
  incrementChatCount: () => Promise<void>
  resetDailyChats: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  // Stable profile update helper
  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!user) return
    if (!supabase) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('users')
      .update(updates)
      .eq('id', user.id)

    if (!error) {
      setProfile(prev => prev ? { ...prev, ...updates } : null)
    }
  }, [user])

  // Stable daily reset helper
  const resetDailyChats = useCallback(async () => {
    if (!profile) return

    await updateProfile({
      chats_used_today: 0,
      last_chat_reset: new Date().toDateString()
    })
  }, [profile, updateProfile])

  // Auth init effect is defined after loadUserProfile

  const loadUserProfile = useCallback(async (userId: string) => {
    if (!supabase) return
    try {
      // For now, create a simple profile without database dependency
      // This avoids database errors during signup
      const defaultProfile: UserProfile = {
        id: userId,
        email: user?.email || '',
        daily_chat_limit: 50,
        chats_used_today: 0,
        last_chat_reset: new Date().toDateString(),
        preferences: {
          theme: 'dark',
          language: 'en',
          notifications: true
        }
      }
      
      setProfile(defaultProfile)
    } catch (error) {
      console.error('Error loading user profile:', error)
    } finally {
      setLoading(false)
    }
  }, [user, resetDailyChats])

  // Auth init effect (moved below loadUserProfile to avoid use-before-declare)
  useEffect(() => {
    if (!supabase) {
      console.warn('Supabase is not configured. Skipping auth init')
      setLoading(false)
      return
    }
    // Get initial session
    supabase!.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        loadUserProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase!.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        if (session?.user) {
          await loadUserProfile(session.user.id)
        } else {
          setProfile(null)
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [loadUserProfile])

  const signUp = async (email: string, password: string, fullName?: string) => {
    if (!supabase) return { error: 'Supabase not configured' }
    
    try {
      const { data, error } = await supabase!.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      })
      
      if (error) {
        return { error: error.message }
      }
      
      // If signup successful and user is immediately confirmed (no email verification)
      if (data.user && data.session) {
        setSession(data.session)
        setUser(data.user)
        await loadUserProfile(data.user.id)
        return { success: true, message: 'Account created successfully!' }
      }
      
      // If email verification is required
      if (data.user && !data.session) {
        return { success: true, message: 'Please check your email to verify your account.' }
      }
      
      return { error: 'Signup failed for unknown reason' }
    } catch (err) {
      return { error: 'Network error during signup' }
    }
  }

  const signIn = async (email: string, password: string) => {
    if (!supabase) return { error: 'Supabase not configured' }
    
    try {
      const { data, error } = await supabase!.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) {
        return { error: error.message }
      }
      
      if (data.user && data.session) {
        setSession(data.session)
        setUser(data.user)
        await loadUserProfile(data.user.id)
        return { success: true, message: 'Welcome back!' }
      }
      
      return { error: 'Sign in failed for unknown reason' }
    } catch (err) {
      return { error: 'Network error during sign in' }
    }
  }

  const signOut = async () => {
    if (!supabase) return
    await supabase!.auth.signOut()
  }

  /* updateProfile defined above as a stable useCallback */

  const canChat = () => {
    if (!profile) return true // Non-authenticated users get 3 chats
    return profile.chats_used_today < profile.daily_chat_limit
  }

  const incrementChatCount = async () => {
    if (!profile) return

    const newCount = profile.chats_used_today + 1
    await updateProfile({ chats_used_today: newCount })
  }

  /* resetDailyChats defined above as a stable useCallback */

  const value = {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    canChat,
    incrementChatCount,
    resetDailyChats
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    // Return a default context instead of throwing an error
    console.warn('useAuth called outside AuthProvider, returning default values')
    return {
      user: null,
      profile: null,
      session: null,
      loading: false,
      signUp: async () => ({ error: 'Auth not available' }),
      signIn: async () => ({ error: 'Auth not available' }),
      signOut: async () => {},
      updateProfile: async () => {},
      canChat: () => true,
      incrementChatCount: async () => {},
      resetDailyChats: async () => {},
    } as AuthContextType
  }
  return context
}
