"use client"
import { Plus } from "lucide-react"

export function NewChatButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2 px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition"
    >
      <Plus className="w-4 h-4" />
      New chat
    </button>
  )
}
