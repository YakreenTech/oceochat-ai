"use client"
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { 
  Users, 
  MessageCircle, 
  Share2, 
  GitBranch, 
  FileText, 
  Calendar,
  MapPin,
  Award,
  TrendingUp,
  Globe
} from 'lucide-react'

interface Researcher {
  id: string
  name: string
  institution: string
  expertise: string[]
  location: string
  projects: number
  publications: number
  avatar?: string
}

interface ResearchTeam {
  id: string
  name: string
  description: string
  members: number
  projects: number
  focus: string[]
  isPublic: boolean
}

export function CollaborationHub() {
  const [activeView, setActiveView] = useState<'researchers' | 'teams' | 'projects'>('researchers')

  const researchers: Researcher[] = [
    {
      id: '1',
      name: 'Dr. Priya Sharma',
      institution: 'Indian Institute of Science',
      expertise: ['Physical Oceanography', 'Climate Modeling', 'ARGO Data'],
      location: 'Bangalore, India',
      projects: 12,
      publications: 45,
      avatar: '/avatars/priya.jpg'
    },
    {
      id: '2',
      name: 'Prof. Rajesh Kumar',
      institution: 'National Institute of Oceanography',
      expertise: ['Marine Biology', 'Ecosystem Modeling', 'Monsoon Studies'],
      location: 'Goa, India',
      projects: 8,
      publications: 67,
      avatar: '/avatars/rajesh.jpg'
    },
    {
      id: '3',
      name: 'Dr. Sarah Chen',
      institution: 'Woods Hole Oceanographic Institution',
      expertise: ['Biogeochemistry', 'Carbon Cycle', 'Satellite Oceanography'],
      location: 'Massachusetts, USA',
      projects: 15,
      publications: 89,
      avatar: '/avatars/sarah.jpg'
    }
  ]

  const teams: ResearchTeam[] = [
    {
      id: '1',
      name: 'Indian Ocean Research Consortium',
      description: 'Collaborative research on Indian Ocean dynamics and climate impacts',
      members: 24,
      projects: 6,
      focus: ['Climate Change', 'Ocean Dynamics', 'Monsoon'],
      isPublic: true
    },
    {
      id: '2',
      name: 'ARGO Data Analytics Group',
      description: 'Advanced analytics and machine learning for ARGO float data',
      members: 12,
      projects: 4,
      focus: ['Data Science', 'Machine Learning', 'ARGO'],
      isPublic: true
    }
  ]

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <div className="flex items-center justify-between p-6">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Collaboration Hub
            </h1>
            <p className="text-sm text-muted-foreground">
              Connect with researchers worldwide and advance oceanographic science together
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Invite Researchers
            </Button>
            <Button size="sm">
              <Users className="w-4 h-4 mr-2" />
              Create Team
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 pb-4">
          <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
            <Button
              variant={activeView === 'researchers' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveView('researchers')}
              className="flex-1"
            >
              <Users className="w-4 h-4 mr-2" />
              Researchers
            </Button>
            <Button
              variant={activeView === 'teams' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveView('teams')}
              className="flex-1"
            >
              <GitBranch className="w-4 h-4 mr-2" />
              Teams
            </Button>
            <Button
              variant={activeView === 'projects' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveView('projects')}
              className="flex-1"
            >
              <FileText className="w-4 h-4 mr-2" />
              Projects
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {activeView === 'researchers' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {researchers.map((researcher) => (
              <Card key={researcher.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={researcher.avatar} />
                      <AvatarFallback>{researcher.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg line-clamp-1">{researcher.name}</CardTitle>
                      <p className="text-sm text-muted-foreground line-clamp-1">{researcher.institution}</p>
                      <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        {researcher.location}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-1">
                      {researcher.expertise.slice(0, 3).map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {researcher.expertise.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{researcher.expertise.length - 3}
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-500" />
                        <span>{researcher.projects} projects</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-green-500" />
                        <span>{researcher.publications} papers</span>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1">
                        <MessageCircle className="w-3 h-3 mr-1" />
                        Connect
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <FileText className="w-3 h-3 mr-1" />
                        Profile
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {activeView === 'teams' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {teams.map((team) => (
              <Card key={team.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{team.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{team.description}</p>
                    </div>
                    {team.isPublic && (
                      <Badge variant="secondary">
                        <Globe className="w-3 h-3 mr-1" />
                        Public
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-1">
                      {team.focus.map((area) => (
                        <Badge key={area} variant="outline" className="text-xs">
                          {area}
                        </Badge>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-purple-500" />
                        <span>{team.members} members</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-orange-500" />
                        <span>{team.projects} active projects</span>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1">
                        Join Team
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        Learn More
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {activeView === 'projects' && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Collaborative Projects</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Discover ongoing research projects and contribute your expertise to advance oceanographic science
            </p>
            <Button>
              <FileText className="w-4 h-4 mr-2" />
              Browse Projects
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
