"use client"
import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Copy,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  Waves
} from 'lucide-react'
import { useChat } from '@/hooks/useChat'
import { ExportActions } from './ExportActions'
import { PromptBox } from '@/components/ui/chatgpt-prompt-input'

interface ChatGPTChatInterfaceProps {
  conversationId?: string | null
  onNewConversation?: (firstMessage?: string) => Promise<string | null>
}

export function ChatGPTChatInterface({
  conversationId,
  onNewConversation
}: ChatGPTChatInterfaceProps) {
  const { messages, isLoading, sendMessage } = useChat(conversationId || undefined, true)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async (message: string) => {
    if (!message.trim() || isLoading) return

    // If no conversation is active, create a new one
    if (!conversationId && onNewConversation) {
      await onNewConversation(message)
    }

    sendMessage(message)
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

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
            <div className="text-center max-w-2xl w-full">
              <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-8">
                How can I help you today?
              </h1>

              {/* Example Prompts Grid - Exact ChatGPT Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
                {examplePrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => handleExampleClick(prompt.text)}
                    className="group p-4 rounded-2xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 text-gray-600 dark:text-gray-400">
                        <prompt.icon className="w-6 h-6" />
                      </div>
                      <div>
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

              {/* ChatGPT-style PromptBox */}
              <div className="w-full max-w-3xl mx-auto">
                <PromptBox
                  onSubmit={handleSend}
                />
              </div>
            </div>
          </div>
        )}

        {/* Chat Messages - Exact ChatGPT Style */}
        {messages.length > 0 && (
          <div className="w-full">
            {messages.map((message, index) => (
              <div
                key={message.id || index}
                className={`group w-full border-b border-gray-100 dark:border-gray-700 ${
                  message.role === 'assistant' ? 'bg-gray-50 dark:bg-gray-700' : 'bg-white dark:bg-gray-800'
                }`}
              >
                <div className="max-w-3xl mx-auto px-4 py-6">
                  <div className="flex gap-6">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {message.role === 'user' ? (
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-sm flex items-center justify-center">
                          <span className="text-white text-sm font-medium">U</span>
                        </div>
                      ) : (
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-sm flex items-center justify-center">
                          <Waves className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Message Content */}
                    <div className="flex-1 min-w-0">
                      <div className="prose prose-gray dark:prose-invert max-w-none">
                        <div className="whitespace-pre-wrap text-gray-900 dark:text-gray-100 leading-7">
                          {message.content}
                        </div>
                      </div>

                      {/* Message Actions - Exact ChatGPT Style */}
                      {message.role === 'assistant' && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="flex items-center gap-2 mt-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                              onClick={() => navigator.clipboard.writeText(message.content)}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                            >
                              <ThumbsUp className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                            >
                              <ThumbsDown className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </Button>
                          </div>

                          {/* Export Actions */}
                          <ExportActions
                            messageContent={message.content}
                            oceanData={message.metadata?.oceanData as unknown}
                            charts={Array.isArray((message as any).metadata?.charts) ? ((message as any).metadata.charts as unknown[]) : []}
                            onExport={(type, format) => {
                              console.log(`Exported ${type} as ${format}`)
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Loading Indicator - Exact ChatGPT Style */}
            {isLoading && (
              <div className="group w-full border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                <div className="max-w-3xl mx-auto px-4 py-6">
                  <div className="flex gap-6">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-sm flex items-center justify-center">
                      <Waves className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
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

      {/* Input Area - ChatGPT Style with PromptBox */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="max-w-3xl mx-auto">
          <PromptBox
            onSubmit={handleSend}
            className="px-4"
          />

          <p className="text-xs text-gray-500 dark:text-gray-400 text-center pb-4">
            OceoChat can make mistakes. Check important info.
          </p>
        </div>
      </div>
    </div>
  )
}
