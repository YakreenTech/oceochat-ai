'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Waves, 
  Globe, 
  Database, 
  Brain, 
  Users, 
  Award,
  ExternalLink,
  Mail,
  MapPin,
  Phone
} from 'lucide-react'
import Link from 'next/link'

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-teal-900/20">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full">
              <Waves className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              OceoChat
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Advanced AI-powered oceanographic research platform revolutionizing marine science
          </p>
          <div className="mt-4">
            <Badge variant="secondary" className="text-sm">
              A Product by YAKREEN Technologies
            </Badge>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* About OceoChat */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-blue-500" />
                About OceoChat
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                OceoChat is a cutting-edge AI-powered platform designed specifically for oceanographic research and marine science applications. Built with advanced artificial intelligence and real-time data integration, it provides researchers, scientists, and marine enthusiasts with unprecedented access to ocean data and analysis.
              </p>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Our platform integrates multiple data sources including ARGO floats, NOAA ocean services, and NASA satellite data to provide comprehensive oceanographic insights with ChatGPT-style conversational interface.
              </p>
            </CardContent>
          </Card>

          {/* Key Features */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-green-500" />
                Key Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <Database className="w-5 h-5 text-blue-500" />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Real-time Ocean Data</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">ARGO, NOAA, NASA integration</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <Brain className="w-5 h-5 text-green-500" />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">AI-Powered Analysis</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Google Gemini Pro & Flash models</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <Globe className="w-5 h-5 text-purple-500" />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Interactive Visualizations</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Charts, maps, and data tables</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* YAKREEN Technologies */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-500" />
              YAKREEN Technologies
            </CardTitle>
            <CardDescription>
              Innovating the future of marine science and oceanographic research
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Our Mission</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  YAKREEN Technologies is dedicated to advancing marine science through innovative AI-powered solutions. We bridge the gap between complex oceanographic data and accessible research tools, empowering scientists and researchers worldwide.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Our Vision</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  To become the leading provider of AI-driven oceanographic research platforms, contributing to better understanding of our oceans and supporting climate change research and marine conservation efforts globally.
                </p>
              </div>
            </div>
            
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Technology Stack</h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">Next.js 15</Badge>
                <Badge variant="outline">React 18</Badge>
                <Badge variant="outline">TypeScript</Badge>
                <Badge variant="outline">Tailwind CSS</Badge>
                <Badge variant="outline">Google Gemini AI</Badge>
                <Badge variant="outline">Supabase</Badge>
                <Badge variant="outline">ARGO Data</Badge>
                <Badge variant="outline">NOAA API</Badge>
                <Badge variant="outline">NASA Ocean Data</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-500" />
              Contact Us
            </CardTitle>
            <CardDescription>
              Get in touch with the YAKREEN Technologies team
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <Mail className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Email</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">contact@yakreen.tech</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <Globe className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Website</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">www.yakreen.tech</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                  <MapPin className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Location</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Global Remote Team</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back to Chat */}
        <div className="text-center mt-12">
          <Link href="/">
            <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white">
              <Waves className="w-4 h-4 mr-2" />
              Back to OceoChat
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
