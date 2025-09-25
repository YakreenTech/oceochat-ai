"use client"
import { useEffect, useState } from "react"
import { Menu } from "lucide-react"
import { Sidebar } from "@/components/sidebar/Sidebar"
import type { ChatItem } from "@/components/sidebar/ChatHistory"
import { ChatInterface } from "@/components/chat/ChatInterface"
import { ThemeToggle } from "@/components/theme/ThemeToggle"
import { AuthButtons } from "@/components/auth/AuthButtons"
import { SettingsDialog } from "@/components/settings/SettingsDialog"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/components/ui/toast"

export function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [chats, setChats] = useState<ChatItem[]>([])
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const { isAuthenticated } = useAuth()
  const { toast, ToastContainer } = useToast()

  // Load persisted UI state
  useEffect(() => {
    const storedOpen = localStorage.getItem('sidebarOpen')
    if (storedOpen != null) setSidebarOpen(storedOpen === 'true')
    if (!isAuthenticated) {
      const storedChats = localStorage.getItem('chats')
      if (storedChats) {
        try { setChats(JSON.parse(storedChats)) } catch {}
      } else {
        setChats([{ id: 'welcome', title: 'Welcome to OceoChat', updatedAt: new Date().toLocaleDateString() }])
      }
      const storedCur = localStorage.getItem('currentConversationId')
      if (storedCur) setCurrentConversationId(storedCur)
    }
  }, [isAuthenticated])

  useEffect(() => {
    localStorage.setItem('sidebarOpen', String(sidebarOpen))
  }, [sidebarOpen])

  useEffect(() => {
    if (!isAuthenticated) localStorage.setItem('chats', JSON.stringify(chats))
  }, [chats, isAuthenticated])

  useEffect(() => {
    if (!isAuthenticated) return
    // Load conversations from API when authenticated
    const load = async () => {
      try {
        const res = await fetch('/api/conversations')
        if (!res.ok) return
        const json: { conversations: Array<{ id: string; title: string; created_at: string }> } = await res.json()
        const mapped: ChatItem[] = (json.conversations || []).map((c) => ({
          id: c.id,
          title: c.title,
          updatedAt: c.created_at,
        }))
        setChats(mapped)
        if (mapped.length && !currentConversationId) setCurrentConversationId(mapped[0].id)
      } catch {}
    }
    load()
  }, [isAuthenticated, currentConversationId])

  const onNewChat = async () => {
    if (isAuthenticated) {
      try {
        const res = await fetch('/api/conversations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: 'New chat' }) })
        const json = await res.json()
        if (json?.conversation) {
          const c = json.conversation
          const newItem: ChatItem = { id: c.id, title: c.title, updatedAt: c.created_at }
          setChats((prev) => [newItem, ...prev])
          setCurrentConversationId(c.id)
          toast('New conversation created', 'success')
        } else {
          toast('Failed to create conversation', 'destructive')
        }
      } catch {
        toast('Error creating conversation', 'destructive')
      }
    } else {
      const id = crypto.randomUUID()
      setChats((prev) => [
        { id, title: "New chat", updatedAt: new Date().toLocaleTimeString() },
        ...prev,
      ])
      setCurrentConversationId(id)
      localStorage.setItem('currentConversationId', id)
      toast('New chat started', 'success')
    }
  }

  const onSelectChat = (id: string) => {
    setCurrentConversationId(id)
    if (!isAuthenticated) localStorage.setItem('currentConversationId', id)
  }

  const onDeleteChat = async (id: string) => {
    if (isAuthenticated) {
      try {
        const res = await fetch(`/api/conversations/${id}`, { method: 'DELETE' })
        if (!res.ok) throw new Error('Failed to delete')
        toast('Conversation deleted', 'success')
      } catch {
        toast('Failed to delete conversation', 'destructive')
        return
      }
    }
    setChats((prev) => prev.filter((c) => c.id !== id))
    if (currentConversationId === id) setCurrentConversationId(chats[0]?.id ?? null)
    if (!isAuthenticated) toast('Chat deleted', 'success')
  }

  const onRenameChat = async (id: string, title: string) => {
    setChats((prev) => prev.map((c) => (c.id === id ? { ...c, title } : c)))
    if (isAuthenticated) {
      try {
        await fetch(`/api/conversations/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title }) })
        toast('Conversation renamed', 'success')
      } catch {
        toast('Failed to rename conversation', 'destructive')
      }
    } else {
      toast('Chat renamed', 'success')
    }
  }

  return (
    <div className="min-h-screen w-full bg-white text-gray-900 dark:bg-[#343541] dark:text-white flex">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        chats={chats}
        onSelectChat={onSelectChat}
        onDeleteChat={onDeleteChat}
        onNewChat={onNewChat}
        onRenameChat={onRenameChat}
      />

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 flex items-center justify-between px-3 border-b border-black/10 dark:border-white/10 bg-white dark:bg-[#343541] sticky top-0 z-30">
          <button
            className="p-2 rounded hover:bg-black/5 dark:hover:bg-white/10"
            onClick={() => setSidebarOpen((o) => !o)}
            aria-label="Toggle sidebar"
            title="Toggle sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="font-medium">OceoChat</div>
          <div className="flex items-center gap-2">
            <SettingsDialog />
            <AuthButtons />
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 overflow-hidden">
          <ChatInterface conversationId={currentConversationId || undefined} persist={isAuthenticated} />
        </main>
      </div>
      <ToastContainer />
    </div>
  )
}
