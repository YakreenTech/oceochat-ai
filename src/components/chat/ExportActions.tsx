"use client"
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Download, 
  FileText, 
  BarChart3, 
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

interface ExportActionsProps {
  messageContent: string
  oceanData?: unknown
  charts?: unknown[]
  onExport?: (type: 'chart' | 'document', format: string) => void
}

export function ExportActions({ 
  messageContent, 
  oceanData, 
  charts = [],
  onExport 
}: ExportActionsProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [exportStatus, setExportStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleChartExport = async (format: 'png' | 'svg' = 'png') => {
    if (charts.length === 0) return

    setIsExporting(true)
    setExportStatus('idle')

    try {
      for (const chart of charts) {
        const response = await fetch('/api/export/chart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chartConfig: chart, format })
        })

        if (!response.ok) throw new Error('Chart export failed')

        const data = await response.json()
        
        // Download the chart
        const link = document.createElement('a')
        link.href = data.imageData
        link.download = data.filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }

      setExportStatus('success')
      onExport?.('chart', format)
    } catch (error) {
      console.error('Chart export error:', error)
      setExportStatus('error')
    } finally {
      setIsExporting(false)
      setTimeout(() => setExportStatus('idle'), 3000)
    }
  }

  const handleDocumentExport = async (format: 'pdf' | 'docx' | 'json' = 'pdf') => {
    setIsExporting(true)
    setExportStatus('idle')

    try {
      // Extract query from message content (first line or sentence)
      const query = messageContent.split('\n')[0] || messageContent.substring(0, 100)
      
      const response = await fetch('/api/export/research-doc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          oceanData,
          analysis: messageContent,
          region: 'Indian Ocean',
          format
        })
      })

      if (!response.ok) throw new Error('Document export failed')

      const data = await response.json()

      if (format === 'json') {
        // Download JSON
        const blob = new Blob([JSON.stringify(data.document, null, 2)], { 
          type: 'application/json' 
        })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = data.filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      } else {
        // Download PDF/DOCX
        const binaryData = atob(data.data)
        const bytes = new Uint8Array(binaryData.length)
        for (let i = 0; i < binaryData.length; i++) {
          bytes[i] = binaryData.charCodeAt(i)
        }
        
        const blob = new Blob([bytes], { type: data.mimeType })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = data.filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      }

      setExportStatus('success')
      onExport?.('document', format)
    } catch (error) {
      console.error('Document export error:', error)
      setExportStatus('error')
    } finally {
      setIsExporting(false)
      setTimeout(() => setExportStatus('idle'), 3000)
    }
  }

  const getStatusIcon = () => {
    switch (exportStatus) {
      case 'success':
        return <CheckCircle className="w-3 h-3 text-green-500" />
      case 'error':
        return <AlertCircle className="w-3 h-3 text-red-500" />
      default:
        return null
    }
  }

  return (
    <div className="flex items-center gap-2 mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
      <div className="text-xs text-gray-500 dark:text-gray-400 mr-2">Export:</div>
      
      {/* Chart Export */}
      {charts.length > 0 && (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleChartExport('png')}
            disabled={isExporting}
            className="h-7 px-2 text-xs text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
          >
            {isExporting ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <BarChart3 className="w-3 h-3" />
            )}
            <span className="ml-1">Charts</span>
          </Button>
        </div>
      )}

      {/* Document Export */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleDocumentExport('pdf')}
          disabled={isExporting}
          className="h-7 px-2 text-xs text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
        >
          {isExporting ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <FileText className="w-3 h-3" />
          )}
          <span className="ml-1">PDF</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleDocumentExport('docx')}
          disabled={isExporting}
          className="h-7 px-2 text-xs text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <Download className="w-3 h-3" />
          <span className="ml-1">Word</span>
        </Button>
      </div>

      {/* Status indicator */}
      {getStatusIcon()}
      
      {exportStatus === 'success' && (
        <span className="text-xs text-green-600 dark:text-green-400">Exported!</span>
      )}
      {exportStatus === 'error' && (
        <span className="text-xs text-red-600 dark:text-red-400">Export failed</span>
      )}
    </div>
  )
}
