'use client'

import React from 'react'

interface MarkdownRendererProps {
  content: string
  className?: string
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  // Parse and render markdown-like content
  const parseContent = (text: string): React.ReactNode[] => {
    const lines = text.split('\n')
    const elements: React.ReactNode[] = []
    let currentParagraph: string[] = []
    let key = 0

    const flushParagraph = () => {
      if (currentParagraph.length > 0) {
        const paragraphText = currentParagraph.join(' ').trim()
        if (paragraphText) {
          elements.push(
            <p key={`p-${key++}`} className="mb-4 leading-relaxed">
              {parseInlineElements(paragraphText)}
            </p>
          )
        }
        currentParagraph = []
      }
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      
      // Empty line - flush current paragraph
      if (!line) {
        flushParagraph()
        continue
      }

      // Headers (## or **text**)
      if (line.startsWith('##') || (line.startsWith('🌊') || line.startsWith('🔍') || line.startsWith('🧪') || line.startsWith('📊') || line.startsWith('⚡') || line.startsWith('👉'))) {
        flushParagraph()
        const headerText = line.replace(/^##\s*/, '').trim()
        elements.push(
          <h3 key={`h-${key++}`} className="text-lg font-semibold mt-6 mb-3 text-gray-900 dark:text-gray-100 flex items-center gap-2">
            {parseInlineElements(headerText)}
          </h3>
        )
        continue
      }

      // Bullet points
      if (line.startsWith('•') || line.startsWith('*') || line.startsWith('-')) {
        flushParagraph()
        
        // Collect all consecutive bullet points
        const bulletPoints: string[] = []
        let j = i
        while (j < lines.length) {
          const bulletLine = lines[j].trim()
          if (bulletLine.startsWith('•') || bulletLine.startsWith('*') || bulletLine.startsWith('-')) {
            bulletPoints.push(bulletLine.replace(/^[•*-]\s*/, '').trim())
            j++
          } else if (!bulletLine) {
            j++
          } else {
            break
          }
        }
        
        if (bulletPoints.length > 0) {
          elements.push(
            <ul key={`ul-${key++}`} className="mb-4 space-y-2 pl-4">
              {bulletPoints.map((point, idx) => (
                <li key={`li-${idx}`} className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span className="flex-1">{parseInlineElements(point)}</span>
                </li>
              ))}
            </ul>
          )
          i = j - 1 // Skip processed lines
        }
        continue
      }

      // Regular text - add to current paragraph
      currentParagraph.push(line)
    }

    // Flush any remaining paragraph
    flushParagraph()

    return elements
  }

  // Parse inline elements like **bold** and *italic*
  const parseInlineElements = (text: string): React.ReactNode[] => {
    const elements: React.ReactNode[] = []
    let currentText = ''
    let i = 0

    const flushText = () => {
      if (currentText) {
        elements.push(currentText)
        currentText = ''
      }
    }

    while (i < text.length) {
      // Bold text **text**
      if (text.substr(i, 2) === '**') {
        flushText()
        const endIndex = text.indexOf('**', i + 2)
        if (endIndex !== -1) {
          const boldText = text.substring(i + 2, endIndex)
          elements.push(
            <strong key={`bold-${elements.length}`} className="font-semibold text-gray-900 dark:text-gray-100">
              {boldText}
            </strong>
          )
          i = endIndex + 2
          continue
        }
      }

      // Italic text *text*
      if (text[i] === '*' && text[i + 1] !== '*') {
        flushText()
        const endIndex = text.indexOf('*', i + 1)
        if (endIndex !== -1) {
          const italicText = text.substring(i + 1, endIndex)
          elements.push(
            <em key={`italic-${elements.length}`} className="italic">
              {italicText}
            </em>
          )
          i = endIndex + 1
          continue
        }
      }

      // Code `text`
      if (text[i] === '`') {
        flushText()
        const endIndex = text.indexOf('`', i + 1)
        if (endIndex !== -1) {
          const codeText = text.substring(i + 1, endIndex)
          elements.push(
            <code key={`code-${elements.length}`} className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm font-mono">
              {codeText}
            </code>
          )
          i = endIndex + 1
          continue
        }
      }

      currentText += text[i]
      i++
    }

    flushText()
    return elements
  }

  return (
    <div className={`markdown-content ${className}`}>
      {parseContent(content)}
    </div>
  )
}
