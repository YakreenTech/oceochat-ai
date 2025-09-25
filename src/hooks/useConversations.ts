"use client"
import { useState, useEffect, useCallback } from 'react'

export interface Conversation {
  id: string
  title: string
  created_at: string
  updated_at: string
  message_count?: number
}

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([])
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [useApi, setUseApi] = useState<boolean | null>(null)

  // Load conversations from API (if authenticated) or fallback to localStorage
  const loadConversations = useCallback(async () => {
    setIsLoading(true)
    try {
      // Try API first
      const res = await fetch('/api/conversations', { cache: 'no-store' })
      if (res.ok) {
        const json = await res.json() as { conversations?: Array<{ id: string | number, title: string, created_at: string, updated_at?: string, message_count?: number }> }
        const list: Conversation[] = (json.conversations || []).map((c) => ({
          id: String(c.id),
          title: c.title,
          created_at: c.created_at,
          updated_at: c.updated_at ?? c.created_at,
          message_count: c.message_count ?? 0,
        }))
        setConversations(list)
        setUseApi(true)
        return
      }
      // If unauthorized or server error, fall back
      setUseApi(false)
      const stored = localStorage.getItem('oceochat:conversations')
      if (stored) {
        const parsed = JSON.parse(stored)
        setConversations(parsed)
      } else {
        const fallback: Conversation[] = []
        setConversations(fallback)
        localStorage.setItem('oceochat:conversations', JSON.stringify(fallback))
      }
    } catch (error) {
      console.error('Failed to load conversations, using fallback:', error)
      setUseApi(false)
      const stored = localStorage.getItem('oceochat:conversations')
      if (stored) {
        const parsed = JSON.parse(stored)
        setConversations(parsed)
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Create new conversation
  const createConversation = useCallback(async (firstMessage?: string) => {
    setIsLoading(true)
    try {
      const title = firstMessage ? generateTitle(firstMessage) : 'New Chat'
      if (useApi) {
        const res = await fetch('/api/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title })
        })
        if (res.ok) {
          const json = await res.json()
          const c = json.conversation
          const created: Conversation = {
            id: String(c.id),
            title: c.title,
            created_at: c.created_at,
            updated_at: c.updated_at ?? c.created_at,
            message_count: c.message_count ?? 0
          }
          const updatedConversations = [created, ...conversations]
          setConversations(updatedConversations)
          setCurrentConversationId(created.id)
          return created.id
        }
      }

      // Fallback (local)
      const newConversation: Conversation = {
        id: crypto.randomUUID(),
        title,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        message_count: 0
      }
      const updatedConversations = [newConversation, ...conversations]
      setConversations(updatedConversations)
      setCurrentConversationId(newConversation.id)
      localStorage.setItem('oceochat:conversations', JSON.stringify(updatedConversations))
      return newConversation.id
    } catch (error) {
      console.error('Failed to create conversation:', error)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [conversations, useApi])

  // Update conversation title
  const updateConversationTitle = useCallback(async (id: string, title: string) => {
    try {
      if (useApi) {
        const res = await fetch(`/api/conversations/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title })
        })
        if (!res.ok) throw new Error('Failed to update via API')
      }
      const updatedConversations = conversations.map(conv =>
        conv.id === id 
          ? { ...conv, title, updated_at: new Date().toISOString() }
          : conv
      )
      setConversations(updatedConversations)
      if (!useApi) {
        localStorage.setItem('oceochat:conversations', JSON.stringify(updatedConversations))
      }
    } catch (error) {
      console.error('Failed to update conversation title:', error)
    }
  }, [conversations, useApi])

  // Delete conversation
  const deleteConversation = useCallback(async (id: string) => {
    try {
      if (useApi) {
        const res = await fetch(`/api/conversations/${id}`, { method: 'DELETE' })
        if (!res.ok) throw new Error('Failed to delete via API')
      }
      const updatedConversations = conversations.filter(conv => conv.id !== id)
      setConversations(updatedConversations)
      if (!useApi) {
        localStorage.setItem('oceochat:conversations', JSON.stringify(updatedConversations))
      }
      if (currentConversationId === id) {
        setCurrentConversationId(null)
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error)
    }
  }, [conversations, currentConversationId, useApi])

  // Generate intelligent title from first message
  const generateTitle = (message: string): string => {
    // Remove common question words and clean up
    const cleanMessage = message
      .replace(/^(what|how|why|when|where|can|could|would|should|tell me|show me|explain|analyze)\s+/i, '')
      .replace(/\?+$/, '')
      .trim()

    // Extract key oceanographic terms
    const oceanTerms = [
      'temperature', 'salinity', 'argo', 'float', 'ocean', 'sea', 'current', 'tide',
      'chlorophyll', 'marine', 'coastal', 'depth', 'pressure', 'monsoon', 'climate'
    ]
    
    const words = cleanMessage.split(' ')
    const importantWords = words.filter(word => 
      word.length > 3 || oceanTerms.includes(word.toLowerCase())
    )
    
    // Take first 4-6 important words
    const titleWords = importantWords.slice(0, Math.min(6, importantWords.length))
    let title = titleWords.join(' ')
    
    // Capitalize first letter
    title = title.charAt(0).toUpperCase() + title.slice(1)
    
    // Add ellipsis if truncated
    if (importantWords.length > 6) {
      title += '...'
    }
    
    return title || 'New Chat'
  }

  // Search functionality
  const searchConversations = useCallback((query: string) => {
    setSearchQuery(query)
    if (!query.trim()) {
      setFilteredConversations(conversations)
    } else {
      const filtered = conversations.filter(conv =>
        conv.title.toLowerCase().includes(query.toLowerCase())
      )
      setFilteredConversations(filtered)
    }
  }, [conversations])

  // Update filtered conversations when conversations change
  useEffect(() => {
    if (searchQuery) {
      searchConversations(searchQuery)
    } else {
      setFilteredConversations(conversations)
    }
  }, [conversations, searchQuery, searchConversations])

  // Load conversations on mount
  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  return {
    conversations: filteredConversations,
    allConversations: conversations,
    currentConversationId,
    setCurrentConversationId,
    createConversation,
    updateConversationTitle,
    deleteConversation,
    searchConversations,
    searchQuery,
    isLoading
  }
}
