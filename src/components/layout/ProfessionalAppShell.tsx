"use client"
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  MessageSquare, 
  PlusCircle, 
  Settings, 
  Menu,
  X,
  Waves,
  ChevronDown,
  MoreHorizontal,
  Share,
  Edit3,
  Trash2
} from 'lucide-react'
import { ProfessionalChatInterface } from '@/components/chat/ProfessionalChatInterface'

interface Conversation {
  id: string
  title: string
  timestamp: string
  preview: string
}

export function ProfessionalAppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [conversations] = useState<Conversation[]>([
    {
      id: '1',
      title: 'Ocean Temperature Analysis',
      timestamp: '2 hours ago',
      preview: 'Analyzing ARGO float data for temperature anomalies...'
    },
    {
      id: '2', 
      title: 'Arabian Sea Salinity Trends',
      timestamp: 'Yesterday',
      preview: 'Compare salinity levels in Arabian Sea vs Bay of Bengal...'
    },
    {
      id: '3',
      title: 'NOAA Tide Predictions',
      timestamp: '3 days ago', 
      preview: 'Get predicted tides for station 9410230...'
    }
  ])

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 ease-in-out overflow-hidden`}>
        <div className="flex flex-col h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Waves className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">OceoChat</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* New Chat Button */}
          <div className="p-4">
            <Button className="w-full justify-start gap-3 bg-gray-900 hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600">
              <PlusCircle className="w-4 h-4" />
              New chat
            </Button>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto px-2">
            <div className="space-y-1">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  className="group relative flex items-start gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                >
                  <MessageSquare className="w-4 h-4 mt-1 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-gray-900 dark:text-white truncate">
                      {conv.title}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                      {conv.preview}
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {conv.timestamp}
                    </div>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <MoreHorizontal className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">U</span>
                </div>
                <div className="text-sm">
                  <div className="font-medium text-gray-900 dark:text-white">User</div>
                  <div className="text-gray-500 dark:text-gray-400">Researcher</div>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            {!sidebarOpen && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-4 h-4" />
              </Button>
            )}
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Model: Auto-selecting best Gemini
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Share className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Edit3 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="flex-1 overflow-hidden">
          <ProfessionalChatInterface />
        </div>
      </div>
    </div>
  )
}
