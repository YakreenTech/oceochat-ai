"use client"

import { useState, useEffect } from 'react'

const GUEST_CHAT_LIMIT = 2
const GUEST_STORAGE_KEY = 'oceochat_guest_chats'

export function useGuestLimits() {
  const [guestChatsUsed, setGuestChatsUsed] = useState(0)
  const [showSignupPrompt, setShowSignupPrompt] = useState(false)

  useEffect(() => {
    // Load guest chat count from localStorage
    try {
      const stored = localStorage.getItem(GUEST_STORAGE_KEY)
      if (stored) {
        const data = JSON.parse(stored)
        const today = new Date().toDateString()
        
        // Reset count if it's a new day
        if (data.date !== today) {
          setGuestChatsUsed(0)
          localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify({ count: 0, date: today }))
        } else {
          setGuestChatsUsed(data.count || 0)
        }
      }
    } catch (error) {
      console.error('Error loading guest chat count:', error)
      setGuestChatsUsed(0)
    }
  }, [])

  const canChat = () => {
    return guestChatsUsed < GUEST_CHAT_LIMIT
  }

  const incrementGuestChats = () => {
    const newCount = guestChatsUsed + 1
    setGuestChatsUsed(newCount)
    
    try {
      const today = new Date().toDateString()
      localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify({ count: newCount, date: today }))
      
      // Show signup prompt when limit is reached
      if (newCount >= GUEST_CHAT_LIMIT) {
        setShowSignupPrompt(true)
      }
    } catch (error) {
      console.error('Error saving guest chat count:', error)
    }
  }

  const getRemainingChats = () => {
    return Math.max(0, GUEST_CHAT_LIMIT - guestChatsUsed)
  }

  const resetGuestChats = () => {
    setGuestChatsUsed(0)
    setShowSignupPrompt(false)
    try {
      localStorage.removeItem(GUEST_STORAGE_KEY)
    } catch (error) {
      console.error('Error resetting guest chats:', error)
    }
  }

  return {
    guestChatsUsed,
    canChat,
    incrementGuestChats,
    getRemainingChats,
    resetGuestChats,
    showSignupPrompt,
    setShowSignupPrompt,
    guestChatLimit: GUEST_CHAT_LIMIT
  }
}
