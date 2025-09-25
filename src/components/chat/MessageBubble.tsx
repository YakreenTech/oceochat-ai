"use client"
import type { Message } from '@/lib/types'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { OceanDataVisualization } from '@/components/ocean/OceanDataVisualization'

export function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user'
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content)
    } catch {}
  }
  return (
    <div className={`w-full flex ${isUser ? 'justify-end' : 'justify-start'} py-2`}>
      <div className={`flex items-start gap-3 w-full max-w-3xl ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div className={`h-7 w-7 rounded-sm flex items-center justify-center text-sm shrink-0 ${isUser ? 'bg-[#19c37d] text-black' : 'bg-[#10a37f] text-white'}`}>
          {isUser ? 'U' : 'O'}
        </div>
        {/* Bubble */}
        <div className={`rounded-lg px-4 py-3 text-[15px] leading-7 whitespace-pre-wrap break-words w-full ${
          isUser ? 'bg-[#343541] text-white' : 'bg-[#444654] text-white'
        }`}>
          <div className="prose prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
              {message.content}
            </ReactMarkdown>
          </div>
          
          {/* Render ocean data visualizations */}
          {Boolean(message.metadata?.oceanData) && (
            // Safe render only when truthy; pass through as unknown to match consumer typing
            <OceanDataVisualization data={message.metadata!.oceanData as unknown as never} />
          )}
          {/* Actions */}
          <div className="mt-2 text-xs text-white/70 flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="sm">Actions</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={handleCopy}>Copy</DropdownMenuItem>
                <DropdownMenuItem onClick={() => alert('Bookmark coming soon')}>Bookmark</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => alert('Retry coming soon')}>Retry</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  )
}
