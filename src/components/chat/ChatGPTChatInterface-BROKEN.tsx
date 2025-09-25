"use client"

import { useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Copy,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  Waves,
  Bot
} from 'lucide-react'
import { useChat } from '@/hooks/useChat'
import { ExportActions } from './ExportActions'
import { PromptBox } from '@/components/ui/chatgpt-prompt-input'
import { cn } from '@/lib/utils'

interface ChatGPTChatInterfaceProps {
  conversationId?: string | null
  onNewConversation?: (firstMessage?: string) => Promise<string | null>
}

export function ChatGPTChatInterface({
  conversationId,
  onNewConversation
}: ChatGPTChatInterfaceProps) {
  const { messages, isLoading, sendMessage } = useChat(conversationId || undefined, true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async (value: string, imageFile?: File) => {
    if (!value.trim() || isLoading) return

    // If no conversation is active, create a new one
    if (!conversationId && onNewConversation) {
      await onNewConversation(value)
    }

    sendMessage(value)
  }

  const handleExampleClick = (text: string) => {
    handleSend(text)
  }

  const examplePrompts = [
    {
      title: "ARGO Data Analysis",
      description: "Analyze temperature anomalies near Mumbai coast",
      text: "Analyze ARGO float data near Mumbai coast for temperature anomalies",
      icon: Waves
    },
    {
      title: "Ocean Patterns",
      description: "Current patterns in the Arabian Sea",
      text: "Show me current ocean patterns in the Arabian Sea",
      icon: Waves
    },
    {
      title: "Monsoon Research",
      description: "Relationship between monsoons and salinity",
      text: "Explain the relationship between monsoons and ocean salinity",
      icon: Waves
    },
    {
      title: "Marine Biodiversity",
      description: "Research summary on biodiversity trends",
      text: "Generate a research summary on marine biodiversity trends",
      icon: Waves
    }
  ]

  // Generate user initials from user ID or use default
  const getUserInitials = (userId?: string) => {
    if (!userId) return 'U'
    return userId.slice(0, 2).toUpperCase()
  }

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-[#343541] relative">
      {/* Messages Container */}
      <div className="flex-1 overflow-hidden relative">
        <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500">
          {/* Welcome Screen - Modern ChatGPT Style */}
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center px-3 sm:px-4 py-8">
              <div className="text-center max-w-3xl w-full space-y-6">
                {/* OceoChat Logo/Avatar */}
                <div className="mb-6">
                  <Avatar className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-cyan-500">
                    <AvatarFallback className="bg-transparent">
                      <Waves className="w-8 h-8 text-white" />
                    </AvatarFallback>
                  </Avatar>
                </div>

                <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  OceoChat
                </h1>

                <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-xl mx-auto leading-relaxed">
                  Your AI assistant for ocean research, marine data analysis, and environmental insights.
                </p>

                {/* Enhanced Example Prompts Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8 max-w-2xl mx-auto">
                  {examplePrompts.map((prompt, index) => (
                    <button
                      key={index}
                      onClick={() => handleExampleClick(prompt.text)}
                      className="group p-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 hover:bg-white dark:hover:bg-gray-600 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200 text-left shadow-sm hover:shadow-md"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                          <prompt.icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                            {prompt.title}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {prompt.description}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Modern Input Area */}
                <div className="w-full max-w-2xl mx-auto">
                  <PromptBox
                    onSubmit={handleSend}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Chat Messages - Modern ChatGPT Style */}
          {messages.length > 0 && (
            <div className="h-full">
              {messages.map((message, index) => (
                <div
                  key={message.id || index}
                  className={cn(
                    "w-full py-6 px-3 sm:px-4",
                    message.role === 'assistant' ? 'bg-white dark:bg-[#343541]' : 'bg-white dark:bg-[#343541]'
                  )}
                >
                  <div className="max-w-3xl mx-auto">
                    <div className="flex gap-4 sm:gap-6">
                      {/* Modern Avatar */}
                      <div className="flex-shrink-0">
                        {message.role === 'user' ? (
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white text-sm font-medium">
                              {getUserInitials(message.userId || 'user')}
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <Avatar className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500">
                            <AvatarFallback className="bg-transparent">
                              <Bot className="w-4 h-4 text-white" />
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>

                      {/* Message Content - Modern Bubble Style */}
                      <div className={cn(
                        "flex-1 min-w-0",
                        message.role === 'user' ? 'flex justify-end' : 'flex justify-start'
                      )}>
                        <div className={cn(
                          "rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 max-w-2xl",
                          message.role === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                        )}>
                          <div className="prose prose-gray dark:prose-invert max-w-none">
                            <div className={cn(
                              "whitespace-pre-wrap leading-relaxed text-sm sm:text-base",
                              message.role === 'user' ? 'text-white' : 'text-gray-900 dark:text-gray-100'
                            )}>
                              {message.content}
                            </div>
                          </div>
                        </div>

                        {/* Modern Message Actions */}
                        {message.role === 'assistant' && (
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 mt-2">
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                                onClick={() => navigator.clipboard.writeText(message.content)}
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                              >
                                <ThumbsUp className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                              >
                                <ThumbsDown className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                              >
                                <RotateCcw className="w-4 h-4" />
                              </Button>
                            </div>

                            {/* Enhanced Export Actions */}
                            <div className="mt-2">
                              <ExportActions
                                messageContent={message.content}
                                oceanData={message.metadata?.oceanData}
                                charts={message.metadata?.charts}
                                onExport={(type, format) => {
                                  console.log(`Exported ${type} as ${format}`)
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Modern Loading Indicator */}
              {isLoading && (
                <div className="w-full py-6 px-3 sm:px-4 bg-white dark:bg-[#343541]">
                  <div className="max-w-3xl mx-auto">
                    <div className="flex gap-4 sm:gap-6">
                      <Avatar className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500">
                        <AvatarFallback className="bg-transparent">
                          <Bot className="w-4 h-4 text-white" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 max-w-xs">
                          <div className="flex space-x-1.5">
                            <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-pulse"></div>
                            <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Modern Input Area */}
      <div className="border-t border-gray-200 dark:border-gray-600 bg-white dark:bg-[#343541] sticky bottom-0">
        <div className="max-w-3xl mx-auto">
          <PromptBox
            onSubmit={handleSend}
            className="px-3 sm:px-4 py-4 sm:py-6"
          />

          <div className="px-3 sm:px-4 pb-3">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              OceoChat can make mistakes. Consider checking important information.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
