"use client"
import { useMemo, useState } from "react"
import { Clock, MessageSquareText, Trash2, Pencil, Search } from "lucide-react"

export interface ChatItem {
  id: string
  title: string
  updatedAt?: string // ISO or locale string
}

function timeAgo(date: string | Date): string {
  const d = new Date(date)
  const now = new Date()
  const diff = Math.round((now.getTime() - d.getTime()) / 1000)
  const minute = 60, hour = 3600, day = 86400, week = 604800, month = 2592000, year = 31536000
  if (diff < minute) return `${diff}s ago`
  if (diff < hour) return `${Math.floor(diff / minute)}m ago`
  if (diff < day) return `${Math.floor(diff / hour)}h ago`
  if (diff < week) return `${Math.floor(diff / day)}d ago`
  if (diff < month) return `${Math.floor(diff / week)}w ago`
  if (diff < year) return `${Math.floor(diff / month)}mo ago`
  return `${Math.floor(diff / year)}y ago`
}

function sectionLabel(date: Date, now = new Date()): string {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const diff = (today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  if (diff <= 7) return 'Previous 7 Days'
  return 'Older'
}

export function ChatHistory({
  chats,
  onSelect,
  onDelete,
  onRename,
}: {
  chats: ChatItem[]
  onSelect: (id: string) => void
  onDelete?: (id: string) => void
  onRename?: (id: string, title: string) => void
}) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [tempTitle, setTempTitle] = useState("")
  const [filter, setFilter] = useState("")

  const grouped = useMemo(() => {
    const groups: Record<string, ChatItem[]> = {}
    const filteredChats = chats.filter(c => c.title.toLowerCase().includes(filter.toLowerCase()))
    const sorted = [...filteredChats].sort((a, b) => {
      const ad = a.updatedAt ? new Date(a.updatedAt).getTime() : 0
      const bd = b.updatedAt ? new Date(b.updatedAt).getTime() : 0
      return bd - ad
    })
    for (const c of sorted) {
      const date = c.updatedAt ? new Date(c.updatedAt) : new Date()
      const label = sectionLabel(date)
      groups[label] = groups[label] || []
      groups[label].push(c)
    }
    return groups
  }, [chats, filter])

  const onStartEdit = (c: ChatItem) => {
    setEditingId(c.id)
    setTempTitle(c.title)
  }
  const onCommitEdit = (c: ChatItem) => {
    if (onRename && tempTitle.trim()) onRename(c.id, tempTitle.trim())
    setEditingId(null)
  }

  const sections = Object.keys(grouped)
  return (
    <div className="mt-2 space-y-2">
      <div className="px-3">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
          <input
            type="text"
            placeholder="Filter chats..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full bg-transparent border border-white/10 rounded-md pl-8 pr-2 py-1 text-sm"
          />
        </div>
      </div>
      {sections.map((label) => (
        <div key={label}>
          <div className="px-3 py-1 text-xs uppercase tracking-wide opacity-60">{label}</div>
          {grouped[label].map((c) => (
            <div key={c.id} className="group flex items-center gap-2 px-3 py-2 rounded-md hover:bg-white/10">
              <button
                onClick={() => onSelect(c.id)}
                className="flex-1 flex items-center gap-2 text-left text-sm min-w-0"
                title={c.title}
              >
                <MessageSquareText className="w-4 h-4 shrink-0 opacity-80" />
                <div className="flex-1 truncate">
                  {editingId === c.id ? (
                    <input
                      autoFocus
                      value={tempTitle}
                      onChange={(e) => setTempTitle(e.target.value)}
                      onBlur={() => onCommitEdit(c)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') onCommitEdit(c)
                        if (e.key === 'Escape') setEditingId(null)
                      }}
                      className="w-full bg-transparent outline-none border-b border-white/20"
                    />
                  ) : (
                    <div className="truncate">{c.title}</div>
                  )}
                  {c.updatedAt && (
                    <div className="text-xs opacity-60 flex items-center gap-1" title={new Date(c.updatedAt).toLocaleString()}>
                      <Clock className="w-3 h-3" /> {timeAgo(c.updatedAt)}
                    </div>
                  )}
                </div>
              </button>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                {onRename && (
                  <button onClick={() => onStartEdit(c)} className="p-1 rounded hover:bg-white/10" title="Rename">
                    <Pencil className="w-4 h-4" />
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => onDelete(c.id)}
                    className="p-1 rounded hover:bg-white/10"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
