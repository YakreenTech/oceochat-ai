"use client"
import React from 'react'

export function TypingIndicator() {
  return (
    <div aria-live="polite" className="flex items-center gap-2 text-xs text-white/70 px-2 py-1">
      <div className="relative h-2 w-10 overflow-hidden">
        <span className="absolute left-0 top-0 h-2 w-2 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="absolute left-3 top-0 h-2 w-2 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="absolute left-6 top-0 h-2 w-2 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      OceoChat is typing…
    </div>
  )
}
