"use client"
import { useState } from 'react'
import { Button } from '@/components/ui/button'

export function ExportMenu({ conversationId }: { conversationId?: string }) {
  const [busy, setBusy] = useState(false)
  if (!conversationId) return null

  const doExport = async (format: 'json' | 'csv') => {
    setBusy(true)
    try {
      const res = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId, format })
      })
      if (!res.ok) return
      const { content, filename, mime } = await res.json()
      const blob = new Blob([content], { type: mime })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="secondary" size="sm" disabled={busy} onClick={() => doExport('json')}>Export JSON</Button>
      <Button variant="secondary" size="sm" disabled={busy} onClick={() => doExport('csv')}>Export CSV</Button>
    </div>
  )
}
