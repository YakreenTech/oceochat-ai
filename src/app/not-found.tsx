'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Home, 
  Search, 
  ArrowLeft, 
  Waves,
  AlertCircle
} from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-teal-900/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full">
              <AlertCircle className="w-12 h-12 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white">
            Page Not Found
          </CardTitle>
          <CardDescription className="text-lg text-gray-600 dark:text-gray-300">
            The page you're looking for doesn't exist or has been moved.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Quick Navigation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/">
              <Button className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white">
                <Home className="w-4 h-4 mr-2" />
                Go to Chat
              </Button>
            </Link>
            
            <Link href="/about-us">
              <Button variant="outline" className="w-full">
                <Waves className="w-4 h-4 mr-2" />
                About OceoChat
              </Button>
            </Link>
          </div>

          {/* Popular Pages */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Popular Pages
            </h3>
            <div className="space-y-2">
              <Link 
                href="/" 
                className="flex items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <Waves className="w-5 h-5 text-blue-500 mr-3" />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Ocean Chat Interface</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">AI-powered oceanographic research</p>
                </div>
              </Link>
              
              <Link 
                href="/about-us" 
                className="flex items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <Search className="w-5 h-5 text-green-500 mr-3" />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">About YAKREEN Technologies</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Learn about our company and mission</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Error Info */}
          <div className="border-t pt-6 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Error 404 • Page Not Found
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              If you believe this is an error, please contact support
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
