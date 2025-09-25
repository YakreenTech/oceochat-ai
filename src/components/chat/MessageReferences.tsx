"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp, ExternalLink, BookOpen } from 'lucide-react'

interface Reference {
  index: number
  title: string
  url: string
}

interface MessageReferencesProps {
  references?: Reference[]
}

export function MessageReferences({ references = [] }: MessageReferencesProps) {
  const [expanded, setExpanded] = useState(false)

  if (!references.length) return null

  return (
    <Card className="mt-3 bg-[#2a2b32] border-[#3a3b42]">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm text-gray-200 flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            References ({references.length})
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="text-gray-400 hover:text-gray-200"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>
      </CardHeader>
      
      {expanded && (
        <CardContent className="pt-0">
          <div className="space-y-2">
            {references.map((ref) => (
              <div key={ref.index} className="bg-[#1a1b22] rounded-lg p-3 border border-[#3a3b42]">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs text-white font-medium">
                    {ref.index}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-gray-200 font-medium mb-1 line-clamp-2">
                      {ref.title}
                    </div>
                    <a
                      href={ref.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 truncate"
                    >
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      {ref.url}
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  )
}
