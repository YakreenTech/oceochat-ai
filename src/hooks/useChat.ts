"use client"
import { useEffect, useState, useCallback } from 'react'
import type { Message } from '@/lib/types'
import type { Database } from '@/lib/supabase-types'

export function useChat(conversationId?: string, persist: boolean = false) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [streaming, setStreaming] = useState(false)

  // Load initial greeting
  useEffect(() => {
    const load = async () => {
      if (persist && conversationId) {
        try {
          const res = await fetch(`/api/conversations/${conversationId}/messages`)
          if (!res.ok) {
            // fallback to greeting
            setMessages([{
              id: crypto.randomUUID(), role: 'assistant', content: 'Hi! I am OceoChat. Ask me about ocean temperatures, ARGO floats, tides, marine weather, and more. 🌊', created_at: new Date().toISOString()
            }])
            return
          }
          const data: { messages?: Database['public']['Tables']['messages']['Row'][] } = await res.json()
          const loaded: Message[] = (data.messages || []).map((m) => ({
            id: m.id,
            role: m.role as Message['role'],
            content: m.content,
            created_at: m.created_at,
            metadata: (m.metadata as Record<string, unknown> | null) || undefined,
          }))
          setMessages(loaded.length ? loaded : [{
            id: crypto.randomUUID(), role: 'assistant', content: 'Hi! I am OceoChat. Ask me about ocean temperatures, ARGO floats, tides, marine weather, and more. 🌊', created_at: new Date().toISOString()
          }])
          return
        } catch {}
      }
      // Not persisted or no conversationId
      setMessages([{
        id: crypto.randomUUID(), role: 'assistant', content: 'Hi! I am OceoChat. Ask me about ocean temperatures, ARGO floats, tides, marine weather, and more. 🌊', created_at: new Date().toISOString()
      }])
    }
    load()
  }, [persist, conversationId])

  const sendMessage = useCallback(async (content: string, options: { stream?: boolean } = {}) => {
    if (!content.trim()) return
    setIsLoading(true)
    setStreaming(options.stream || false)

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: content.trim(),
      created_at: new Date().toISOString(),
    }
    setMessages(prev => [...prev, userMessage])

    try {
      // Get user preferences (model selection is now automatic in backend)
      const useStreaming = localStorage.getItem('oceochat:streaming') === 'true'

      if (options.stream && useStreaming) {
        try {
          await fetch(`/api/conversations/${conversationId}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role: 'user', content }),
          })
        } catch {}
      }

      if (options.stream && useStreaming) {
        setStreaming(true)
        // Create placeholder assistant message to append chunks
        const id = crypto.randomUUID()
        let finalBuffer = ''
        setMessages((prev) => [
          ...prev,
          { id, role: 'assistant', content: '', created_at: new Date().toISOString() },
        ])

        const res = await fetch('/api/chat/stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: content, conversationId }),
        })
        const reader = res.body?.getReader()
        const decoder = new TextDecoder()
        if (reader) {
          // Read server-sent chunks
          // Expect lines like: `data: {"chunk":"text"}\n\n`
          let buffer = ''
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            buffer += decoder.decode(value, { stream: true })
            const parts = buffer.split('\n\n')
            buffer = parts.pop() || ''
            for (const part of parts) {
              if (part.startsWith('data:')) {
                const json = part.slice(5).trim()
                try {
                  const payload = JSON.parse(json)
                  if (payload.chunk) {
                    finalBuffer += payload.chunk
                    setMessages((prev) => prev.map(m => m.id === id ? { ...m, content: (m.content || '') + payload.chunk } : m))
                  }
                  if (payload.meta) {
                    setMessages((prev) => prev.map(m => m.id === id ? { ...m, metadata: payload.meta } : m))
                  }
                } catch {}
              }
            }
          }
        }
        // Persist assistant after stream completes
        const finalText = finalBuffer
        if (persist && conversationId && finalText) {
          try {
            await fetch(`/api/conversations/${conversationId}/messages`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ role: 'assistant', content: finalText }),
            })
          } catch {}
        }
        setStreaming(false)
      } else {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: content, conversationId }),
        })
        const data = await res.json()
        const assistantMsg: Message = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: data.response ?? 'No response',
          created_at: new Date().toISOString(),
          metadata: { oceanData: data.oceanData, research: data.research, charts: data.oceanData?.charts },
        }
        setMessages((prev) => [...prev, assistantMsg])
        if (persist && conversationId && assistantMsg.content) {
          try {
            await fetch(`/api/conversations/${conversationId}/messages`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ role: 'assistant', content: assistantMsg.content, metadata: assistantMsg.metadata }),
            })
          } catch {}
        }
      }
    } catch {
      const errMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Sorry, something went wrong while processing your request.',
        created_at: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, errMsg])
    } finally {
      setIsLoading(false)
    }
  }, [conversationId, persist])

  return { messages, isLoading, sendMessage, streaming }
}
