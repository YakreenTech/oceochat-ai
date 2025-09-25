"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Plus,
  Settings,
  Menu,
  X,
  Waves,
  ChevronDown,
  MoreHorizontal,
  Share,
  User,
  LogOut
} from 'lucide-react'
import ChatGPTInterface from '@/components/chat/ChatGPTInterface'
import Link from 'next/link'
import { ConversationItem } from '@/components/sidebar/ConversationItem'
import { SearchBar } from '@/components/sidebar/SearchBar-ULTRA-MODERN'
import { useConversations } from '@/hooks/useConversations'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

export function ChatGPTAppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [showUserMenu, setShowUserMenu] = useState(false)

  const {
    conversations,
    currentConversationId,
    setCurrentConversationId,
    createConversation,
    updateConversationTitle,
    deleteConversation,
    searchConversations,
    isLoading
  } = useConversations()

  const { user, signOut, loading } = useAuth()

  // Handle click outside for user menu
  useEffect(() => {
    const handleClickOutside = () => {
      setShowUserMenu(false)
    }

    if (showUserMenu) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [showUserMenu])

  // Persist sidebar open state across reloads
  useEffect(() => {
    try {
      const saved = localStorage.getItem('chatSidebarOpen')
      if (saved !== null) setSidebarOpen(saved === 'true')
    } catch {}
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem('chatSidebarOpen', String(sidebarOpen))
    } catch {}
  }, [sidebarOpen])

  // Show loading state while auth is initializing
  if (loading) {
    return (
      <div className="flex h-screen bg-[#343541] text-gray-100 items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Waves className="w-4 h-4 text-white animate-pulse" />
          </div>
          <p className="text-gray-300">Loading OceoChat...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-[#343541] text-gray-100">
      {/* Sidebar */}
      <div className={cn(
        "w-64 transition-all duration-300 ease-in-out overflow-hidden flex-shrink-0 border-r border-[#2a2b32] bg-[#202123] shadow-lg",
        !sidebarOpen && "w-0"
      )}>
        <div className="flex flex-col h-full bg-transparent">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[#2a2b32]">
            <h2 className="text-lg font-semibold text-gray-100">
              Chat History
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-300 hover:text-white hover:bg-[#2a2b32] rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {user ? (
            <>
              {/* New Chat Button */}
              <div className="p-4">
                <Button
                  className={cn(
                    "w-full justify-start gap-3 bg-[#202123] hover:bg-[#2a2b32] text-gray-100 border border-[#2a2b32] rounded-lg h-12 font-medium transition-all duration-200",
                    isLoading && "opacity-50 cursor-not-allowed"
                  )}
                  onClick={() => createConversation()}
                  disabled={isLoading}
                >
                  <Plus className="w-4 h-4" />
                  New chat
                </Button>
              </div>

              {/* Search Bar */}
              <SearchBar onSearch={searchConversations} />

              {/* Conversations */}
              <div className="flex-1 overflow-y-auto px-4">
                <div className="space-y-2">
                  {conversations.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-sm text-gray-400">No conversations yet</p>
                      <p className="text-xs text-gray-500 mt-2">Start a new chat to get started</p>
                    </div>
                  ) : (
                    conversations.map((conv) => (
                      <ConversationItem
                        key={conv.id}
                        conversation={conv}
                        isActive={conv.id === currentConversationId}
                        onClick={() => setCurrentConversationId(conv.id)}
                        onRename={updateConversationTitle}
                        onDelete={deleteConversation}
                      />
                    ))
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="p-4">
              <div className="space-y-3">
                <p className="text-sm text-gray-300">Sign in to create and view your chat history.</p>
                <div className="flex gap-2">
                  <Link href="/auth/sign-in" className="flex-1">
                    <Button className="w-full bg-white text-black hover:bg-white/90">Sign in</Button>
                  </Link>
                  <Link href="/auth/sign-up" className="flex-1">
                    <Button variant="outline" className="w-full border-[#2a2b32] text-gray-100 hover:bg-[#2a2b32]">Sign up</Button>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="p-4 border-t border-[#2a2b32] bg-[#202123]">
            {user ? (
              <div className="relative">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 text-gray-200 hover:text-white hover:bg-[#2a2b32] h-12 rounded-lg transition-colors"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowUserMenu(!showUserMenu)
                  }}
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-sm">
                    <Waves className="w-4 h-4 text-white" />
                  </div>
                  <span className="flex-1 text-left font-medium">{user.email ?? 'OceoChat User'}</span>
                  <ChevronDown className="w-4 h-4" />
                </Button>

                {/* User Menu */}
                {showUserMenu && (
                  <div className="absolute bottom-full left-0 right-0 mb-2 bg-[#202123] border border-[#2a2b32] rounded-lg shadow-lg overflow-hidden">
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3 text-gray-200 hover:text-white hover:bg-[#2a2b32] rounded-none h-10"
                    >
                      <User className="w-4 h-4" />
                      My account
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3 text-gray-200 hover:text-white hover:bg-[#2a2b32] rounded-none h-10"
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </Button>
                    <div className="border-t border-gray-200 dark:border-gray-600"></div>
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3 text-gray-200 hover:text-white hover:bg-[#2a2b32] rounded-none h-10"
                      onClick={() => signOut()}
                    >
                      <LogOut className="w-4 h-4" />
                      Log out
                    </Button>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#343541]">
        {/* Top Bar */}
        <div className="flex items-center justify-between p-4 bg-[#343541] border-b border-[#2a2b32]">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(prev => !prev)}
              className="text-gray-200 hover:text-white hover:bg-[#2a2b32] rounded-lg transition-colors"
              aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-semibold text-gray-100">
              OceoChat
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-200 hover:text-white hover:bg-[#2a2b32] rounded-lg transition-colors"
              aria-label="Export JSON"
            >
              <Share className="w-4 h-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-200 hover:text-white hover:bg-[#2a2b32] rounded-lg transition-colors"
                  aria-label="More actions"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[12rem]">
                <DropdownMenuItem>
                  Export Markdown
                </DropdownMenuItem>
                <DropdownMenuItem>
                  Copy Conversation
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="flex-1 overflow-hidden bg-[#343541]">
          <ChatGPTInterface
            conversationId={currentConversationId}
          />
        </div>
      </div>
    </div>
  )
}
