"use client"
import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { 
  MessageSquare, 
  MoreHorizontal,
  Edit3,
  Trash2,
  Check,
  X
} from 'lucide-react'
import type { Conversation } from '@/hooks/useConversations'

interface ConversationItemProps {
  conversation: Conversation
  isActive: boolean
  onClick: () => void
  onRename: (id: string, title: string) => void
  onDelete: (id: string) => void
}

export function ConversationItem({ 
  conversation, 
  isActive, 
  onClick, 
  onRename, 
  onDelete 
}: ConversationItemProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(conversation.title)
  const inputRef = useRef<HTMLInputElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false)
      }
    }

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showMenu])

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleEdit = () => {
    setIsEditing(true)
    setShowMenu(false)
  }

  const handleSave = () => {
    if (editTitle.trim() && editTitle !== conversation.title) {
      onRename(conversation.id, editTitle.trim())
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditTitle(conversation.title)
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

  const handleDelete = () => {
    if (confirm('Delete this conversation?')) {
      onDelete(conversation.id)
    }
    setShowMenu(false)
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 1) {
      return 'Just now'
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else if (diffInHours < 48) {
      return 'Yesterday'
    } else {
      const days = Math.floor(diffInHours / 24)
      return `${days} days ago`
    }
  }

  return (
    <div
      className={`group relative flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
        isActive 
          ? 'bg-gray-800 text-gray-100' 
          : 'text-gray-300 hover:bg-gray-800 hover:text-gray-100'
      }`}
      onClick={!isEditing ? onClick : undefined}
    >
      <MessageSquare className="w-4 h-4 flex-shrink-0" />
      
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-gray-700 text-gray-100 text-sm rounded px-2 py-1 border border-gray-600 focus:border-blue-500 focus:outline-none"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSave}
              className="h-6 w-6 p-0 text-green-400 hover:text-green-300"
            >
              <Check className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        ) : (
          <div className="text-sm font-medium truncate">
            {conversation.title}
          </div>
        )}
      </div>

      {!isEditing && (
        <div className="relative" ref={menuRef}>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 w-6 p-0 text-gray-400 hover:text-gray-200 hover:bg-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation()
              setShowMenu(!showMenu)
            }}
          >
            <MoreHorizontal className="w-3 h-3" />
          </Button>

          {/* Dropdown Menu */}
          {showMenu && (
            <div className="absolute right-0 top-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg overflow-hidden z-10 min-w-[120px]">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEdit}
                className="w-full justify-start gap-2 text-gray-300 hover:text-gray-100 hover:bg-gray-700 rounded-none h-8"
              >
                <Edit3 className="w-3 h-3" />
                Rename
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="w-full justify-start gap-2 text-red-400 hover:text-red-300 hover:bg-gray-700 rounded-none h-8"
              >
                <Trash2 className="w-3 h-3" />
                Delete
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
