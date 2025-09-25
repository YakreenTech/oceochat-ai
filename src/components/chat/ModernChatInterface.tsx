"use client"
import { useState, useRef, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Send, 
  Mic, 
  Paperclip, 
  MoreHorizontal, 
  Copy, 
  ThumbsUp, 
  ThumbsDown,
  RefreshCw,
  Sparkles,
  Brain,
  Waves
} from 'lucide-react'
import { useChat } from '@/hooks/useChat'
import { OceanDataVisualization } from '@/components/ocean/OceanDataVisualization'

interface ModernChatInterfaceProps {
  conversationId?: string
  persist?: boolean
}

export function ModernChatInterface({ conversationId, persist }: ModernChatInterfaceProps) {
  const { messages, isLoading, sendMessage, streaming } = useChat(conversationId, !!persist)
  const [input, setInput] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = () => {
    if (!input.trim() || isLoading) return
    sendMessage(input.trim(), { stream: true })
    setInput('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    // Auto-resize textarea
    const textarea = e.target
    textarea.style.height = 'auto'
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px'
  }

  const researchPrompts = [
    "Analyze ARGO float data near Mumbai coast for temperature anomalies",
    "Compare salinity levels in Arabian Sea vs Bay of Bengal",
    "Show recent ocean current patterns in Indian Ocean",
    "Generate research summary for monsoon impact on ocean temperature"
  ]

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900">
      {/* Header */}
      <div className="border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
              <Waves className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-semibold">OceoChat Research AI</h2>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Auto-selecting best Gemini model</span>
                <Badge variant="secondary" className="text-xs">Research Mode</Badge>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center mb-6">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Welcome to OceoChat Research AI</h3>
              <p className="text-muted-foreground mb-8 max-w-md">
                Your intelligent companion for oceanographic research. Ask questions about ARGO data, 
                ocean patterns, and marine science in natural language.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
                {researchPrompts.map((prompt, index) => (
                  <Card 
                    key={index}
                    className="p-4 cursor-pointer hover:shadow-md transition-shadow border-dashed"
                    onClick={() => setInput(prompt)}
                  >
                    <div className="flex items-start gap-3">
                      <Sparkles className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-left">{prompt}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {messages.map((message, index) => (
            <div key={message.id} className="px-4 py-6">
              <div className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                    <Waves className="w-4 h-4 text-white" />
                  </div>
                )}
                
                <div className={`max-w-3xl ${message.role === 'user' ? 'order-first' : ''}`}>
                  {message.role === 'user' ? (
                    <div className="bg-blue-500 text-white rounded-2xl px-4 py-3 ml-auto max-w-xs md:max-w-md">
                      <p className="text-sm">{message.content}</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        <div className="whitespace-pre-wrap">{message.content}</div>
                      </div>
                      
                      {/* Ocean Data Visualization */}
                      {message.metadata?.oceanData && (
                        <div className="mt-4">
                          <OceanDataVisualization data={message.metadata.oceanData} />
                        </div>
                      )}
                      
                      {/* Message Actions */}
                      <div className="flex items-center gap-2 pt-2">
                        <Button variant="ghost" size="sm" className="h-8 px-2">
                          <Copy className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 px-2">
                          <ThumbsUp className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 px-2">
                          <ThumbsDown className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 px-2">
                          <RefreshCw className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium">U</span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {(isLoading || streaming) && (
            <div className="px-4 py-6">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                  <Waves className="w-4 h-4 text-white" />
                </div>
                <div className="flex items-center gap-1">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-sm text-muted-foreground ml-2">OceoChat is analyzing...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto p-4">
          <div className="relative">
            <div className="flex items-end gap-3 p-3 border rounded-2xl bg-white dark:bg-slate-800 shadow-sm">
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex-shrink-0"
                disabled={isLoading}
              >
                <Paperclip className="w-4 h-4" />
              </Button>
              
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Ask about ocean data, ARGO floats, research insights..."
                className="flex-1 resize-none border-0 bg-transparent focus:outline-none focus:ring-0 text-sm min-h-[20px] max-h-[200px]"
                rows={1}
                disabled={isLoading}
              />
              
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className={isRecording ? 'text-red-500' : ''}
                  onClick={() => setIsRecording(!isRecording)}
                  disabled={isLoading}
                >
                  <Mic className="w-4 h-4" />
                </Button>
                
                <Button 
                  size="sm"
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="rounded-xl"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
          
          <p className="text-xs text-muted-foreground text-center mt-2">
            OceoChat can make mistakes. Verify important oceanographic data with authoritative sources.
          </p>
        </div>
      </div>
    </div>
  )
}
