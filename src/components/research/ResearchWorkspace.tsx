"use client"
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { 
  FileText, 
  BarChart3, 
  Users, 
  Download, 
  Share2, 
  BookOpen,
  Microscope,
  Globe,
  TrendingUp
} from 'lucide-react'

interface ResearchProject {
  id: string
  title: string
  description: string
  status: 'active' | 'completed' | 'draft'
  collaborators: number
  lastUpdated: string
  tags: string[]
}

export function ResearchWorkspace() {
  const [activeProject, setActiveProject] = useState<string | null>(null)
  
  const projects: ResearchProject[] = [
    {
      id: '1',
      title: 'Indian Ocean Temperature Trends',
      description: 'Analysis of ARGO float data showing warming patterns in the Indian Ocean over the past decade',
      status: 'active',
      collaborators: 4,
      lastUpdated: '2 hours ago',
      tags: ['Temperature', 'Climate Change', 'ARGO']
    },
    {
      id: '2', 
      title: 'Monsoon Impact on Salinity',
      description: 'Investigating how monsoon patterns affect ocean salinity levels in the Bay of Bengal',
      status: 'draft',
      collaborators: 2,
      lastUpdated: '1 day ago',
      tags: ['Salinity', 'Monsoon', 'Bay of Bengal']
    }
  ]

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <div className="flex items-center justify-between p-4">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Research Workspace
            </h1>
            <p className="text-sm text-muted-foreground">
              Collaborative oceanographic research platform
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button size="sm">
              <FileText className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="projects" className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-4 mx-4 mt-4">
            <TabsTrigger value="projects" className="flex items-center gap-2">
              <Microscope className="w-4 h-4" />
              Projects
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Data Analysis
            </TabsTrigger>
            <TabsTrigger value="collaborate" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Collaborate
            </TabsTrigger>
            <TabsTrigger value="learn" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Learn
            </TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="flex-1 p-4 overflow-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project) => (
                <Card key={project.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg line-clamp-2">{project.title}</CardTitle>
                      <Badge variant={project.status === 'active' ? 'default' : project.status === 'completed' ? 'secondary' : 'outline'}>
                        {project.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                      {project.description}
                    </p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {project.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <Separator className="my-3" />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {project.collaborators} collaborators
                      </div>
                      <span>{project.lastUpdated}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {/* Create New Project Card */}
              <Card className="border-dashed border-2 hover:border-blue-300 transition-colors cursor-pointer">
                <CardContent className="flex flex-col items-center justify-center h-48 text-center">
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-3">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold mb-1">Start New Research</h3>
                  <p className="text-sm text-muted-foreground">
                    Create a new oceanographic research project
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="data" className="flex-1 p-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    ARGO Float Network
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Active Floats</span>
                      <Badge>3,847</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Recent Profiles</span>
                      <Badge variant="secondary">12,456</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Indian Ocean Coverage</span>
                      <Badge variant="outline">847 floats</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Recent Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm font-medium">Temperature Anomaly Detected</p>
                      <p className="text-xs text-muted-foreground">Arabian Sea showing +2.1°C above average</p>
                    </div>
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <p className="text-sm font-medium">New ARGO Deployment</p>
                      <p className="text-xs text-muted-foreground">15 new floats deployed in Bay of Bengal</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="collaborate" className="flex-1 p-4">
            <div className="text-center py-12">
              <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Collaboration Hub</h3>
              <p className="text-muted-foreground mb-6">
                Connect with researchers worldwide and share oceanographic insights
              </p>
              <Button>
                <Users className="w-4 h-4 mr-2" />
                Find Collaborators
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="learn" className="flex-1 p-4">
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Learning Resources</h3>
              <p className="text-muted-foreground mb-6">
                Educational materials and tutorials for oceanographic research
              </p>
              <Button>
                <BookOpen className="w-4 h-4 mr-2" />
                Browse Tutorials
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
