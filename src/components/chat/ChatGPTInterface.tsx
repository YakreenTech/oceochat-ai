"use client"

import React, { useState, useRef, useEffect } from 'react'
import { PromptBox } from '@/components/ui/chatgpt-prompt-input'
import { Button } from '@/components/ui/button'
import { Waves, User, Copy, ThumbsUp, ThumbsDown } from 'lucide-react'
import { LiveDataDisplay } from '@/components/visualizations/LiveDataDisplay'
import { MarkdownRenderer } from '@/components/ui/MarkdownRenderer'
import { useAuth } from '@/contexts/AuthContext'
import { useGuestLimits } from '@/hooks/useGuestLimits'
import { SignupPrompt } from '@/components/auth/SignupPrompt'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isStreaming?: boolean
  visualizations?: any[]
  tables?: any[]
  maps?: any[]
  metadata?: any
}

interface ChatGPTInterfaceProps {
  conversationId?: string | null
}

export default function ChatGPTInterface({ conversationId }: ChatGPTInterfaceProps) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // Use conversationId for future conversation management
  console.log('Current conversation:', conversationId)

  const { 
    canChat, 
    incrementGuestChats, 
    getRemainingChats, 
    showSignupPrompt, 
    setShowSignupPrompt 
  } = useGuestLimits()

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Auto-resize is now handled by PromptBox internally

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return

    // Check guest limits for non-authenticated users
    if (!user && !canChat()) {
      setShowSignupPrompt(true)
      return
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText.trim(),
      timestamp: new Date()
    }

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true
    }

    setMessages(prev => [...prev, userMessage, assistantMessage])
    setIsLoading(true)

    // Increment guest chat count for non-authenticated users
    if (!user) {
      incrementGuestChats()
    }

    try {
      const response = await fetch('/api/ocean-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          conversationId: conversationId || 'default',
          streamResponse: true
        })
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response body')

      let accumulatedContent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = new TextDecoder().decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              if (data.content || data.chunk) {
                const newContent = data.content || data.chunk
                accumulatedContent += newContent
                setMessages(prev => prev.map(msg => 
                  msg.id === assistantMessage.id 
                    ? { ...msg, content: accumulatedContent }
                    : msg
                ))
              }
            } catch {
              // Ignore parsing errors for incomplete chunks
            }
          }
        }
      }

      // Mark streaming as complete
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessage.id 
          ? { ...msg, isStreaming: false }
          : msg
      ))

    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessage.id 
          ? { 
              ...msg, 
              content: `Sorry, I encountered an error: ${errorMessage}. Please check the console for more details and try again.`,
              isStreaming: false 
            }
          : msg
      ))
    } finally {
      setIsLoading(false)
    }
  }

  const handlePromptSubmit = (value: string) => {
    sendMessage(value)
  }

  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)
  const [likedMessages, setLikedMessages] = useState<Set<string>>(new Set())
  const [dislikedMessages, setDislikedMessages] = useState<Set<string>>(new Set())

  const copyMessage = async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedMessageId(messageId)
      setTimeout(() => setCopiedMessageId(null), 2000)
    } catch (error) {
      console.error('Failed to copy message:', error)
    }
  }

  const likeMessage = (messageId: string) => {
    setLikedMessages(prev => {
      const newSet = new Set(prev)
      if (newSet.has(messageId)) {
        newSet.delete(messageId)
      } else {
        newSet.add(messageId)
        setDislikedMessages(prev => {
          const dislikeSet = new Set(prev)
          dislikeSet.delete(messageId)
          return dislikeSet
        })
      }
      return newSet
    })
  }

  const dislikeMessage = (messageId: string) => {
    setDislikedMessages(prev => {
      const newSet = new Set(prev)
      if (newSet.has(messageId)) {
        newSet.delete(messageId)
      } else {
        newSet.add(messageId)
        setLikedMessages(prev => {
          const likeSet = new Set(prev)
          likeSet.delete(messageId)
          return likeSet
        })
      }
      return newSet
    })
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          // Welcome Screen
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-2xl mx-auto px-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Waves className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Welcome to OceoChat
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-lg mb-8 leading-relaxed">
                Your AI-powered oceanographic research assistant. Ask me about ocean data, marine science, or climate research.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
                     onClick={() => sendMessage("What's the current temperature in the Bay of Bengal?")}>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">🌊 Ocean Temperature</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">Get real-time temperature data from ARGO floats</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
                     onClick={() => sendMessage("Show me ARGO floats near Mumbai")}>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">🔬 ARGO Floats</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">Explore autonomous ocean profiling floats</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
                     onClick={() => sendMessage("Research ocean warming trends in the Indian Ocean")}>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">📈 Climate Research</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">Analyze climate patterns and trends</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
                     onClick={() => sendMessage("Compare salinity between Arabian Sea and Bay of Bengal")}>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">📊 Data Analysis</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">Compare and analyze oceanographic parameters</p>
                </div>
              </div>
              {!user && (
                <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                  <p className="text-blue-800 dark:text-blue-200 text-sm">
                    🎯 You have <span className="font-semibold">{getRemainingChats()}</span> free chats remaining.
                    <span className="font-medium text-blue-600 dark:text-blue-400 ml-1">Sign up for unlimited access!</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          // Messages List
          <div className="max-w-4xl mx-auto">
            {messages.map((message, index) => (
              <div key={message.id} className={cn(
                "group relative px-4 py-6 transition-colors",
                message.role === 'assistant' ? 'bg-gray-50/50 dark:bg-gray-800/20' : 'bg-white dark:bg-gray-900',
                index === messages.length - 1 && message.isStreaming && "animate-pulse"
              )}>
                <div className={cn(
                  "max-w-4xl mx-auto flex gap-4",
                  message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                )}>
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center shadow-sm",
                      message.role === 'user' 
                        ? "bg-gradient-to-br from-emerald-500 to-teal-600" 
                        : "bg-gradient-to-br from-blue-500 to-cyan-500"
                    )}>
                      {message.role === 'user' ? (
                        <User className="w-4 h-4 text-white" />
                      ) : (
                        <Waves className="w-4 h-4 text-white" />
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className={cn(
                    "flex-1 min-w-0",
                    message.role === 'user' ? 'text-right' : 'text-left'
                  )}>
                    {/* Message Content */}
                    <div className={cn(
                      "inline-block max-w-[80%] rounded-2xl px-4 py-3 shadow-sm",
                      message.role === 'user' 
                        ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white ml-auto" 
                        : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700"
                    )}>
                      {message.role === 'user' ? (
                        <div className="text-[15px] leading-relaxed whitespace-pre-wrap">
                          {message.content}
                        </div>
                      ) : (
                        <div className="text-[15px] leading-relaxed">
                          <MarkdownRenderer content={message.content} />
                          {message.isStreaming && (
                            <span className="inline-block w-2 h-4 bg-current ml-1 animate-pulse rounded-sm opacity-70" />
                          )}
                        </div>
                      )}
                      
                      {/* Live Data Visualizations */}
                      {message.role === 'assistant' && !message.isStreaming && (
                        message.visualizations?.length > 0 || 
                        message.tables?.length > 0 || 
                        message.maps?.length > 0
                      ) && (
                        <div className="mt-4">
                          <LiveDataDisplay
                            visualizations={message.visualizations}
                            tables={message.tables}
                            maps={message.maps}
                            title="Ocean Data Analysis"
                          />
                        </div>
                      )}
                    </div>

                    {/* Timestamp and Actions */}
                    <div className={cn(
                      "flex items-center gap-2 mt-2 text-xs text-gray-500 dark:text-gray-400",
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    )}>
                      <span>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      
                      {/* Message Actions for AI responses */}
                      {message.role === 'assistant' && message.content && !message.isStreaming && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 ml-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyMessage(message.content, message.id)}
                            className={cn(
                              "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg h-6 px-2 transition-all duration-200",
                              copiedMessageId === message.id && "text-green-500 scale-110"
                            )}
                          >
                            <Copy className={cn(
                              "w-3 h-3 transition-transform duration-200",
                              copiedMessageId === message.id && "scale-110"
                            )} />
                            {copiedMessageId === message.id && (
                              <span className="ml-1 text-xs font-medium">Copied!</span>
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => likeMessage(message.id)}
                            className={cn(
                              "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg h-6 px-2 transition-all duration-200",
                              likedMessages.has(message.id) && "text-green-500 bg-green-50 dark:bg-green-900/20 scale-110"
                            )}
                          >
                            <ThumbsUp className={cn(
                              "w-3 h-3 transition-all duration-200",
                              likedMessages.has(message.id) && "scale-110 fill-current"
                            )} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => dislikeMessage(message.id)}
                            className={cn(
                              "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg h-6 px-2 transition-all duration-200",
                              dislikedMessages.has(message.id) && "text-red-500 bg-red-50 dark:bg-red-900/20 scale-110"
                            )}
                          >
                            <ThumbsDown className={cn(
                              "w-3 h-3 transition-all duration-200",
                              dislikedMessages.has(message.id) && "scale-110 fill-current"
                            )} />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="relative">
            <PromptBox
              onSubmit={handlePromptSubmit}
              disabled={isLoading || (!user && !canChat())}
              placeholder={
                !user && !canChat() 
                  ? "Sign up to continue chatting..." 
                  : isLoading 
                    ? "OceoChat is analyzing..." 
                    : "Ask about ocean research, ARGO floats, marine data analysis..."
              }
              className="w-full shadow-xl border-gray-300 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-800 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all duration-200"
            />
            {isLoading && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            )}
          </div>
          
          {!user && (
            <div className="text-center mt-3">
              {canChat() ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  🎯 Guest mode: <span className="font-medium text-amber-600 dark:text-amber-400">{getRemainingChats()} messages remaining</span>
                </p>
              ) : (
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    Message limit reached. <button 
                      className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
                      onClick={() => setShowSignupPrompt(true)}
                    >
                      Sign up for unlimited chats
                    </button>
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Signup Prompt Modal */}
      <SignupPrompt 
        open={showSignupPrompt}
        onClose={() => setShowSignupPrompt(false)}
        remainingChats={getRemainingChats()}
      />
    </div>
  )
}
