'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { 
  Activity, 
  BarChart3, 
  Database, 
  FileText, 
  Waves,
  ChevronDown,
  Sparkles,
  TrendingUp,
  Map
} from 'lucide-react'
import { ResearchToolsService, ToolNotificationService } from '@/services/research-tools'

export interface ResearchTool {
  id: string
  name: string
  description: string
  icon: React.ComponentType<any>
  category: 'analysis' | 'visualization' | 'data' | 'document'
  badge?: string
  color: string
  action?: () => Promise<void> | void
}

const researchTools: ResearchTool[] = [
  {
    id: 'argo-analysis',
    name: 'ARGO Float Analysis',
    description: 'Real-time analysis of temperature and salinity profiles from 4000+ autonomous floats worldwide',
    icon: Activity,
    category: 'analysis',
    badge: 'Real-time',
    color: 'bg-blue-500',
    action: async () => {
      ToolNotificationService.showInfo('Analyzing ARGO float data...')
      const result = await ResearchToolsService.executeTool('argo-analysis')
      if (result.success) {
        ToolNotificationService.showSuccess(result.message)
      } else {
        ToolNotificationService.showError(result.message)
      }
    }
  },
  {
    id: 'ocean-database',
    name: 'Multi-Source Ocean Data',
    description: 'Access live data from NOAA, NASA, ESA Copernicus, and INCOIS with intelligent integration',
    icon: Database,
    category: 'data',
    badge: 'Live Data',
    color: 'bg-green-500',
    action: async () => {
      ToolNotificationService.showInfo('Accessing multi-source ocean databases...')
      const result = await ResearchToolsService.executeTool('ocean-database')
      if (result.success) {
        ToolNotificationService.showSuccess(result.message)
      } else {
        ToolNotificationService.showError(result.message)
      }
    }
  },
  {
    id: 'research-charts',
    name: 'Advanced Chart Generator',
    description: 'Create publication-ready oceanographic visualizations with interactive features',
    icon: BarChart3,
    category: 'visualization',
    badge: 'Interactive',
    color: 'bg-purple-500',
    action: async () => {
      ToolNotificationService.showInfo('Generating research charts...')
      const result = await ResearchToolsService.executeTool('research-charts')
      if (result.success) {
        ToolNotificationService.showSuccess(result.message)
        // Could open chart in modal or new tab
        console.log('Chart data:', result.data)
      } else {
        ToolNotificationService.showError(result.message)
      }
    }
  },
  {
    id: 'research-document',
    name: 'Research Document Generator',
    description: 'Generate professional research papers with automatic citations and formatting',
    icon: FileText,
    category: 'document',
    badge: 'PDF Export',
    color: 'bg-orange-500',
    action: async () => {
      ToolNotificationService.showInfo('Generating research document...')
      const result = await ResearchToolsService.executeTool('research-document')
      if (result.success) {
        ToolNotificationService.showSuccess(result.message)
        if (result.downloadUrl) {
          // Trigger download
          const link = document.createElement('a')
          link.href = result.downloadUrl
          link.download = 'research-document.pdf'
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        }
      } else {
        ToolNotificationService.showError(result.message)
      }
    }
  },
  {
    id: 'deep-analysis',
    name: 'AI-Powered Ocean Analysis',
    description: 'Advanced statistical analysis, pattern recognition, and predictive modeling',
    icon: TrendingUp,
    category: 'analysis',
    badge: 'AI-Powered',
    color: 'bg-red-500',
    action: async () => {
      ToolNotificationService.showInfo('Running AI-powered analysis...')
      const result = await ResearchToolsService.executeTool('deep-analysis')
      if (result.success) {
        ToolNotificationService.showSuccess(result.message)
        console.log('AI Analysis results:', result.data)
      } else {
        ToolNotificationService.showError(result.message)
      }
    }
  },
  {
    id: 'spatial-mapping',
    name: 'Interactive Ocean Mapping',
    description: 'Geographic analysis with real-time oceanographic data layers and GIS integration',
    icon: Map,
    category: 'visualization',
    badge: 'GIS',
    color: 'bg-teal-500',
    action: async () => {
      ToolNotificationService.showInfo('Creating interactive ocean map...')
      const result = await ResearchToolsService.executeTool('spatial-mapping')
      if (result.success) {
        ToolNotificationService.showSuccess(result.message)
        // Could open map in modal or new tab
        console.log('Map data:', result.data)
      } else {
        ToolNotificationService.showError(result.message)
      }
    }
  }
]

interface ModernToolsDropdownProps {
  selectedTool: ResearchTool | null
  onToolSelect: (tool: ResearchTool | null) => void
  className?: string
}

export function ModernToolsDropdown({ 
  selectedTool, 
  onToolSelect, 
  className = '' 
}: ModernToolsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)

  const categories = {
    analysis: { label: 'Data Analysis', icon: Activity },
    visualization: { label: 'Visualization', icon: BarChart3 },
    data: { label: 'Data Sources', icon: Database },
    document: { label: 'Documentation', icon: FileText }
  }

  const getToolsByCategory = (category: ResearchTool['category']) => {
    return researchTools.filter(tool => tool.category === category)
  }

  const [isProcessing, setIsProcessing] = useState<string | null>(null)

  const handleToolSelect = async (tool: ResearchTool) => {
    try {
      setIsProcessing(tool.id)
      
      // Execute tool action if available
      if (tool.action) {
        await tool.action()
      }
      
      // Visual feedback animation
      const toolElement = document.querySelector(`[data-tool-id="${tool.id}"]`)
      if (toolElement) {
        toolElement.classList.add('animate-pulse', 'scale-105')
        setTimeout(() => {
          toolElement.classList.remove('animate-pulse', 'scale-105')
        }, 1000)
      }
      
      onToolSelect(selectedTool?.id === tool.id ? null : tool)
      setIsOpen(false)
      
    } catch (error) {
      console.error(`Error executing ${tool.name}:`, error)
      // Show error feedback
      const toolElement = document.querySelector(`[data-tool-id="${tool.id}"]`)
      if (toolElement) {
        toolElement.classList.add('animate-bounce', 'text-red-500')
        setTimeout(() => {
          toolElement.classList.remove('animate-bounce', 'text-red-500')
        }, 1000)
      }
    } finally {
      setIsProcessing(null)
    }
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={selectedTool ? "default" : "outline"} 
          className={`flex items-center gap-2 transition-all duration-200 ${className}`}
        >
          {selectedTool ? (
            <>
              <selectedTool.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{selectedTool.name}</span>
              <span className="sm:hidden">Tool</span>
            </>
          ) : (
            <>
              <Waves className="h-4 w-4" />
              <span>Tools</span>
            </>
          )}
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        className="w-80 max-h-96 overflow-y-auto" 
        align="start"
        sideOffset={8}
      >
        <DropdownMenuLabel className="flex items-center gap-2 text-base font-semibold">
          <Sparkles className="h-4 w-4 text-blue-500" />
          Research Tools
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />

        {Object.entries(categories).map(([categoryKey, categoryInfo]) => {
          const categoryTools = getToolsByCategory(categoryKey as ResearchTool['category'])
          
          if (categoryTools.length === 0) return null

          return (
            <div key={categoryKey}>
              <DropdownMenuLabel className="flex items-center gap-2 text-sm font-medium text-gray-600 px-2 py-1">
                <categoryInfo.icon className="h-3 w-3" />
                {categoryInfo.label}
              </DropdownMenuLabel>
              
              {categoryTools.map((tool) => {
                const Icon = tool.icon
                const isSelected = selectedTool?.id === tool.id
                
                const isProcessingTool = isProcessing === tool.id
                
                return (
                  <DropdownMenuItem
                    key={tool.id}
                    data-tool-id={tool.id}
                    onClick={() => handleToolSelect(tool)}
                    disabled={isProcessingTool}
                    className={`flex items-start gap-3 p-3 cursor-pointer transition-all duration-200 ${
                      isSelected ? 'bg-blue-50 border-l-2 border-blue-500' : 'hover:bg-gray-50'
                    } ${isProcessingTool ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className={`p-1.5 rounded-md ${tool.color} text-white flex-shrink-0 transition-all duration-200 ${
                      isProcessingTool ? 'animate-pulse scale-110' : ''
                    }`}>
                      <Icon className={`h-3 w-3 ${isProcessingTool ? 'animate-spin' : ''}`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm truncate">
                          {isProcessingTool ? 'Processing...' : tool.name}
                        </span>
                        {tool.badge && !isProcessingTool && (
                          <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                            {tool.badge}
                          </Badge>
                        )}
                        {isProcessingTool && (
                          <Badge variant="secondary" className="text-xs px-1.5 py-0.5 animate-pulse">
                            Working...
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {isProcessingTool ? 'Executing tool functionality...' : tool.description}
                      </p>
                    </div>
                  </DropdownMenuItem>
                )
              })}
              
              <DropdownMenuSeparator />
            </div>
          )
        })}

        {selectedTool && (
          <>
            <DropdownMenuItem
              onClick={() => onToolSelect(null)}
              className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <span className="text-sm">Clear selection</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Export the tools for use in other components
export { researchTools }
export type { ResearchTool }
