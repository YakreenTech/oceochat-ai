'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Settings } from '@/components/settings/Settings'
import { useAuth } from '@/contexts/AuthContext'

interface ChatGPTChatInterfaceProps {
  conversationId?: string | null
  onNewConversation?: (firstMessage?: string) => Promise<string | null>
  onChatAttempt?: () => boolean
}

export function ChatGPTChatInterface({
  conversationId,
  onNewConversation,
  onChatAttempt
}: ChatGPTChatInterfaceProps) {
  const { user, profile, canChat, incrementChatCount, loading } = useAuth()
  const [showSettings, setShowSettings] = useState(false)
  const [chatCount, setChatCount] = useState(0)

  const handleChatAttempt = async () => {
    if (onChatAttempt) {
      return onChatAttempt()
    }
    return true
  }

  const handleSettingsClick = () => {
    setShowSettings(true)
  }

  // This component would normally handle the chat interface
  // For now, return a placeholder that shows authentication features
  return (
    <>
      <div className="flex flex-col h-full">
        <div className="p-4 text-center">
          <h2 className="text-xl font-semibold mb-4">Enhanced OceoChat Interface</h2>

          {loading ? (
            <p>Loading...</p>
          ) : user ? (
            <div className="space-y-4">
              <p className="text-green-600 dark:text-green-400">
                ✅ Authenticated as: {user.email}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Daily chats: {profile?.chats_used_today || 0} / {profile?.daily_chat_limit || 50}
              </p>
              <Button
                onClick={handleSettingsClick}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
              >
                Open Settings
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-yellow-600 dark:text-yellow-400">
                ⚠️ Guest Mode: 3 free chats available
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Chats used: {chatCount}/3
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Sign up for unlimited ocean research access
              </p>
              <Button
                onClick={handleSettingsClick}
                variant="outline"
              >
                Settings (Guest)
              </Button>
            </div>
          )}
        </div>
      </div>

      {showSettings && (
        <Settings onClose={() => setShowSettings(false)} />
      )}
    </>
  )
}
