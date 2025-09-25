"use client"
import { useChat } from '@/hooks/useChat'
import { MessageBubble } from './MessageBubble'
import { ChatInput } from './ChatInput'
import { TypingIndicator } from './TypingIndicator'
import { ExportMenu } from './ExportMenu'

export function ChatInterface({ conversationId, persist }: { conversationId?: string; persist?: boolean }) {
  const { messages, isLoading, sendMessage, streaming } = useChat(conversationId, !!persist)

  return (
    <div className="flex h-full flex-col bg-[#343541]">
      {/* Header for actions */}
      {persist && conversationId && (
        <div className="flex justify-end items-center p-2 border-b border-white/10">
          <ExportMenu conversationId={conversationId} />
        </div>
      )}

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex justify-center">
          <div className="w-full max-w-3xl px-4 py-6">
            {messages.map((m, idx) => (
              <div key={m.id}>
                <MessageBubble message={m} />
                {/* Separator between messages */}
                {idx < messages.length - 1 && (
                  <div className="h-px bg-white/5 my-2" />
                )}
              </div>
            ))}
            {(isLoading || streaming) && <TypingIndicator />}
          </div>
        </div>
      </div>

      {/* Composer */}
      <div className="sticky bottom-0 bg-gradient-to-t from-[#343541] via-[#343541] to-transparent px-3 pb-4 pt-2">
        <div className="flex justify-center">
          <div className="w-full max-w-3xl">
            <ChatInput onSend={(msg) => sendMessage(msg, { stream: true })} disabled={isLoading} />
            <div className="text-[11px] text-white/50 text-center mt-2">
              OceoChat can make mistakes. Consider verifying important information.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
