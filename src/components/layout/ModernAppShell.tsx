"use client"

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  MessageSquare, 
  Microscope, 
  Users, 
  BookOpen, 
  Settings, 
  Menu,
  Search,
  Bell,
  User,
  Waves,
  BarChart3,
  Globe,
  Zap
} from 'lucide-react'
import { ModernChatInterface } from '@/components/chat/ModernChatInterface'
import { ResearchWorkspace } from '@/components/research/ResearchWorkspace'
import { useAuth } from '@/hooks/useAuth'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { AuthButtons } from '@/components/auth/AuthButtons'

export function ModernAppShell() {
  const [activeTab, setActiveTab] = useState('chat')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const { isAuthenticated, userId } = useAuth()

  // Persist collapsed state across reloads
  useEffect(() => {
    try {
      const saved = localStorage.getItem('modernSidebarCollapsed')
      if (saved !== null) {
        setSidebarCollapsed(saved === 'true')
      }
    } catch {}
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem('modernSidebarCollapsed', String(sidebarCollapsed))
    } catch {}
  }, [sidebarCollapsed])

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex">
      {/* Modern Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} transition-all duration-300 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-r border-white/20 flex flex-col`}>
        {/* Logo & Brand */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
              <Waves className="w-5 h-5 text-white" />
            </div>
            {!sidebarCollapsed && (
              <div>
                <h1 className="font-bold text-lg bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  OceoChat
                </h1>
                <p className="text-xs text-muted-foreground">Research AI Platform</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <Button
            variant={activeTab === 'chat' ? 'default' : 'ghost'}
            className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : 'px-3'}`}
            onClick={() => setActiveTab('chat')}
          >
            <MessageSquare className="w-4 h-4" />
            {!sidebarCollapsed && <span className="ml-2">AI Chat</span>}
          </Button>

          <Button
            variant={activeTab === 'research' ? 'default' : 'ghost'}
            className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : 'px-3'}`}
            onClick={() => setActiveTab('research')}
          >
            <Microscope className="w-4 h-4" />
            {!sidebarCollapsed && <span className="ml-2">Research</span>}
          </Button>

          <Button
            variant={activeTab === 'data' ? 'default' : 'ghost'}
            className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : 'px-3'}`}
            onClick={() => setActiveTab('data')}
          >
            <BarChart3 className="w-4 h-4" />
            {!sidebarCollapsed && <span className="ml-2">Data Explorer</span>}
          </Button>

          <Button
            variant={activeTab === 'collaborate' ? 'default' : 'ghost'}
            className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : 'px-3'}`}
            onClick={() => setActiveTab('collaborate')}
          >
            <Users className="w-4 h-4" />
            {!sidebarCollapsed && <span className="ml-2">Collaborate</span>}
          </Button>

          <Button
            variant={activeTab === 'learn' ? 'default' : 'ghost'}
            className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : 'px-3'}`}
            onClick={() => setActiveTab('learn')}
          >
            <BookOpen className="w-4 h-4" />
            {!sidebarCollapsed && <span className="ml-2">Learn</span>}
          </Button>

          {!sidebarCollapsed && (
            <>
              <Separator className="my-4" />
              
              {/* Quick Stats */}
              <div className="space-y-3">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Ocean Data Status
                </div>
                
                <Card className="p-3 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium">ARGO Floats</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">3,847</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Active worldwide</p>
                </Card>

                <Card className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium">Live Data</span>
                    </div>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Real-time updates</p>
                </Card>
              </div>
            </>
          )}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-white/10">
          {isAuthenticated ? (
            <div className={`flex items-center gap-3 ${sidebarCollapsed ? 'justify-center' : ''}`}>
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              {!sidebarCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{userId ?? 'Guest'}</p>
                  <p className="text-xs text-muted-foreground">Researcher</p>
                </div>
              )}
            </div>
          ) : (
            <AuthButtons />
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-white/20 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              <Menu className="w-4 h-4" />
            </Button>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search research, data, or ask AI..."
                className="pl-10 pr-4 py-2 bg-white/50 dark:bg-slate-800/50 border border-white/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-96"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm">
              <Bell className="w-4 h-4" />
            </Button>
            <ThemeToggle />
            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-hidden">
          {activeTab === 'chat' && <ModernChatInterface />}
          {activeTab === 'research' && <ResearchWorkspace />}
          {activeTab === 'data' && (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Data Explorer</h3>
                <p className="text-muted-foreground">Interactive ocean data visualization and analysis tools</p>
              </div>
            </div>
          )}
          {activeTab === 'collaborate' && (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Collaboration Hub</h3>
                <p className="text-muted-foreground">Connect with researchers and share insights</p>
              </div>
            </div>
          )}
          {activeTab === 'learn' && (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Learning Center</h3>
                <p className="text-muted-foreground">Educational resources and tutorials</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
