'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  ResearchDocumentGenerator, 
  ResearchDocument, 
  ResearchWorkflow 
} from '@/lib/research-document-generator'
import { 
  FileText, 
  Download, 
  Plus, 
  X, 
  BookOpen, 
  Users, 
  Tags,
  FileDown,
  Loader2
} from 'lucide-react'

interface ResearchDocumentCreatorProps {
  oceanData?: any[]
  initialTitle?: string
  onDocumentCreated?: (document: ResearchDocument) => void
}

export function ResearchDocumentCreator({ 
  oceanData = [], 
  initialTitle = '',
  onDocumentCreated 
}: ResearchDocumentCreatorProps) {
  const [title, setTitle] = useState(initialTitle || 'Ocean Research Analysis')
  const [authors, setAuthors] = useState(['OceoChat Research Platform'])
  const [newAuthor, setNewAuthor] = useState('')
  const [abstract, setAbstract] = useState('')
  const [keywords, setKeywords] = useState(['oceanography', 'data analysis'])
  const [newKeyword, setNewKeyword] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedDocument, setGeneratedDocument] = useState<ResearchDocument | null>(null)

  const addAuthor = () => {
    if (newAuthor.trim() && !authors.includes(newAuthor.trim())) {
      setAuthors([...authors, newAuthor.trim()])
      setNewAuthor('')
    }
  }

  const removeAuthor = (author: string) => {
    setAuthors(authors.filter(a => a !== author))
  }

  const addKeyword = () => {
    if (newKeyword.trim() && !keywords.includes(newKeyword.trim())) {
      setKeywords([...keywords, newKeyword.trim()])
      setNewKeyword('')
    }
  }

  const removeKeyword = (keyword: string) => {
    setKeywords(keywords.filter(k => k !== keyword))
  }

  const generateDocument = async () => {
    setIsGenerating(true)
    try {
      // Process ocean data if available
      const analysis = await ResearchWorkflow.processOceanData(oceanData)
      
      // Generate research document
      const document = ResearchWorkflow.generateResearchDocument(
        title,
        oceanData,
        analysis
      )

      // Update with user inputs
      document.authors = authors
      document.abstract = abstract || document.abstract
      document.keywords = keywords

      setGeneratedDocument(document)
      onDocumentCreated?.(document)
    } catch (error) {
      console.error('Error generating document:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadPDF = async () => {
    if (!generatedDocument) return

    const generator = new ResearchDocumentGenerator()
    const pdfBlob = generator.generateDocument(generatedDocument)
    
    const url = URL.createObjectURL(pdfBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title.replace(/\s+/g, '_')}_research_paper.pdf`
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadJSON = () => {
    if (!generatedDocument) return

    const blob = new Blob([JSON.stringify(generatedDocument, null, 2)], { 
      type: 'application/json' 
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title.replace(/\s+/g, '_')}_research_data.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Research Document Creator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Document Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Document Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter research document title"
              className="text-lg font-medium"
            />
          </div>

          {/* Authors */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Authors
            </Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {authors.map((author) => (
                <Badge key={author} variant="secondary" className="flex items-center gap-1">
                  {author}
                  <X 
                    className="h-3 w-3 cursor-pointer hover:text-red-500" 
                    onClick={() => removeAuthor(author)}
                  />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newAuthor}
                onChange={(e) => setNewAuthor(e.target.value)}
                placeholder="Add author name"
                onKeyPress={(e) => e.key === 'Enter' && addAuthor()}
              />
              <Button onClick={addAuthor} size="sm" variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Keywords */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Tags className="h-4 w-4" />
              Keywords
            </Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {keywords.map((keyword) => (
                <Badge key={keyword} variant="outline" className="flex items-center gap-1">
                  {keyword}
                  <X 
                    className="h-3 w-3 cursor-pointer hover:text-red-500" 
                    onClick={() => removeKeyword(keyword)}
                  />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                placeholder="Add keyword"
                onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
              />
              <Button onClick={addKeyword} size="sm" variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Abstract */}
          <div className="space-y-2">
            <Label htmlFor="abstract">Abstract (Optional)</Label>
            <Textarea
              id="abstract"
              value={abstract}
              onChange={(e) => setAbstract(e.target.value)}
              placeholder="Enter custom abstract or leave blank for auto-generation"
              rows={4}
            />
          </div>

          {/* Data Summary */}
          {oceanData.length > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">Data Available for Analysis</h4>
              <div className="text-sm text-blue-700">
                <p>• {oceanData.length} data points loaded</p>
                {oceanData[0]?.temperature && <p>• Temperature measurements included</p>}
                {oceanData[0]?.salinity && <p>• Salinity data available</p>}
                {oceanData[0]?.predictions && <p>• Tide prediction data loaded</p>}
              </div>
            </div>
          )}

          {/* Generate Button */}
          <Button 
            onClick={generateDocument} 
            disabled={isGenerating || !title.trim()}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating Document...
              </>
            ) : (
              <>
                <BookOpen className="h-4 w-4 mr-2" />
                Generate Research Document
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Document Preview */}
      {generatedDocument && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Generated Document
              </span>
              <div className="flex gap-2">
                <Button onClick={downloadJSON} variant="outline" size="sm">
                  <FileDown className="h-4 w-4 mr-1" />
                  JSON
                </Button>
                <Button onClick={downloadPDF} size="sm">
                  <Download className="h-4 w-4 mr-1" />
                  PDF
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div>
                <h3 className="text-xl font-bold">{generatedDocument.title}</h3>
                <p className="text-gray-600 mt-1">{generatedDocument.authors.join(', ')}</p>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="font-semibold mb-2">Abstract</h4>
                <p className="text-sm text-gray-700">{generatedDocument.abstract}</p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Keywords</h4>
                <div className="flex flex-wrap gap-1">
                  {generatedDocument.keywords.map((keyword) => (
                    <Badge key={keyword} variant="secondary" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Sections</h4>
                <div className="space-y-2">
                  {generatedDocument.sections.map((section, index) => (
                    <div key={index} className="border-l-2 border-blue-200 pl-3">
                      <h5 className="font-medium text-sm">{section.title}</h5>
                      <p className="text-xs text-gray-600 line-clamp-2">{section.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
