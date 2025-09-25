"use client"
import { X } from "lucide-react"
import { NewChatButton } from "./NewChatButton"
import { ChatHistory, ChatItem } from "./ChatHistory"
import { ScrollArea } from "@/components/ui/scroll-area"

export function Sidebar({
  open,
  onClose,
  chats,
  onSelectChat,
  onDeleteChat,
  onNewChat,
  onRenameChat,
}: {
  open: boolean
  onClose: () => void
  chats: ChatItem[]
  onSelectChat: (id: string) => void
  onDeleteChat?: (id: string) => void
  onNewChat: () => void
  onRenameChat?: (id: string, title: string) => void
}) {
  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      {open && (
        <aside className="fixed lg:static z-50 top-0 left-0 h-full w-64 bg-gray-50 text-gray-900 dark:bg-[#202123] dark:text-white flex flex-col p-3 transition-transform duration-200 ease-out lg:min-h-screen">
          <div className="flex items-center justify-between mb-3">
            <div className="font-semibold">OceoChat</div>
            <button className="lg:hidden p-2 rounded hover:bg-black/5 dark:hover:bg-white/10" onClick={onClose}>
              <X className="w-5 h-5" />
            </button>
          </div>

          <NewChatButton onClick={onNewChat} />

          <div className="mt-3 flex-1">
            <ScrollArea className="h-full">
              <ChatHistory chats={chats} onSelect={onSelectChat} onDelete={onDeleteChat} onRename={onRenameChat} />
            </ScrollArea>
          </div>

          {/* Footer actions */}
          <div className="mt-3 space-y-1 text-sm">
            <button onClick={() => alert('Settings coming soon')} className="w-full text-left px-3 py-2 rounded hover:bg-black/5 dark:hover:bg-white/10 opacity-90">Settings</button>
            <button onClick={() => alert('About coming soon')} className="w-full text-left px-3 py-2 rounded hover:bg-black/5 dark:hover:bg-white/10 opacity-90">About</button>
            <div className="px-3 pt-2 text-xs opacity-60">© {new Date().getFullYear()} OceoChat</div>
          </div>
        </aside>
      )}
    </>
  )
}
