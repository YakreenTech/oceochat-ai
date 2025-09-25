"use client"
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function AuthButtons() {
  const [email, setEmail] = useState('')
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [signedIn, setSignedIn] = useState(false)

  // Initialize session state
  useEffect(() => {
    const init = async () => {
      if (!supabase) return
      const { data } = await supabase.auth.getUser()
      setSignedIn(!!data.user)
      supabase.auth.onAuthStateChange((_event, session) => {
        setSignedIn(!!session?.user)
      })
    }
    init()
  }, [])

  const signInWithMagicLink = async () => {
    if (!supabase) {
      alert('Supabase not configured')
      return
    }
    if (!email.trim()) return
    setLoading(true)
    try {
      const redirectTo = typeof window !== 'undefined' ? window.location.origin : undefined
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: redirectTo },
      })
      if (error) throw error
      alert('Magic link sent! Check your email to complete sign-in.')
      setOpen(false)
    } catch (e: any) {
      alert(e?.message || 'Failed to send magic link')
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    if (!supabase) return
    setLoading(true)
    try {
      await supabase.auth.signOut()
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-xs opacity-70 px-2 py-1">…</div>
  }

  return signedIn ? (
    <Button onClick={signOut} variant="secondary" size="sm">Sign out</Button>
  ) : (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">Sign in</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sign in with email</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button onClick={signInWithMagicLink} disabled={!email.trim()}>
            Send magic link
          </Button>
          <div className="text-xs opacity-70">
            We’ll email you a sign-in link. No password required.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
