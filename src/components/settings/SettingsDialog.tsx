"use client"
import { useEffect, useMemo, useState } from "react"
import { useTheme } from "@/components/theme/ThemeProvider"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

type GeminiModel = 'gemini-1.5-flash' | 'gemini-1.5-flash-8b' | 'gemini-1.5-pro' | 'gemini-pro'

export function SettingsDialog() {
  const [open, setOpen] = useState(false)
  const { theme, toggle } = useTheme()

  // Local settings state persisted to localStorage
  const [model, setModel] = useState<GeminiModel>('gemini-1.5-flash')
  const [streaming, setStreaming] = useState<boolean>(true)

  useEffect(() => {
    try {
      const savedModel = localStorage.getItem('oceochat:model') as GeminiModel | null
      const savedStreaming = localStorage.getItem('oceochat:streaming')
      if (savedModel) setModel(savedModel)
      if (savedStreaming != null) setStreaming(savedStreaming === '1')
    } catch {}
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem('oceochat:model', model)
      localStorage.setItem('oceochat:streaming', streaming ? '1' : '0')
    } catch {}
  }, [model, streaming])

  const tabs = useMemo(() => (
    [
      { key: 'general', label: 'General' },
      { key: 'model', label: 'Model' },
      { key: 'data', label: 'Data Sources' },
      { key: 'profile', label: 'Profile' },
    ] as const
  ), [])
  const [activeTab, setActiveTab] = useState<typeof tabs[number]['key']>('general')
  // Profile state
  const [profileLoading, setProfileLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [fullName, setFullName] = useState('')
  const [institution, setInstitution] = useState('')
  const [researchArea, setResearchArea] = useState('')
  const [expertise, setExpertise] = useState<'beginner' | 'intermediate' | 'advanced' | 'expert'>('beginner')

  // Load profile when profile tab opens
  useEffect(() => {
    if (activeTab !== 'profile') return
    let mounted = true
    ;(async () => {
      setProfileLoading(true)
      try {
        const res = await fetch('/api/profile', { cache: 'no-store' })
        if (res.ok) {
          const data = await res.json()
          const p = data.profile || {}
          if (!mounted) return
          setFullName(p.full_name || '')
          setInstitution(p.institution || '')
          setResearchArea(p.research_area || '')
          setExpertise(p.expertise_level || 'beginner')
        }
      } finally {
        if (mounted) setProfileLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [activeTab])

  const saveProfile = async () => {
    setSaving(true)
    try {
      await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName,
          institution,
          research_area: researchArea,
          expertise_level: expertise,
        })
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">Settings</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>Configure OceoChat preferences</DialogDescription>
        </DialogHeader>

        <div className="mt-2 grid grid-cols-4 gap-4">
          {/* Sidebar tabs */}
          <div className="col-span-4 sm:col-span-1">
            <div className="space-y-1">
              {tabs.map(t => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className={`w-full text-left px-3 py-2 rounded-md transition ${activeTab === t.key ? 'bg-white/10' : 'hover:bg-white/5'}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="col-span-4 sm:col-span-3">
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Theme</div>
                    <div className="text-sm opacity-70">Current: {theme}</div>
                  </div>
                  <Button variant="secondary" size="sm" onClick={toggle}>Toggle Theme</Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Streaming responses</div>
                    <div className="text-sm opacity-70">Enable server-sent events for smoother replies</div>
                  </div>
                  <button
                    onClick={() => setStreaming(s => !s)}
                    className={`px-3 py-1 rounded-md text-sm ${streaming ? 'bg-green-600' : 'bg-white/10'}`}
                  >
                    {streaming ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'model' && (
              <div className="space-y-4">
                <div className="font-medium">AI Model Settings</div>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="font-medium text-blue-900 dark:text-blue-100">Automatic Model Selection</span>
                  </div>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                    OceoChat automatically selects the best available Gemini model for optimal performance. 
                    The system tries Gemini 1.5 Pro first, then falls back to Gemini 1.5 Flash if needed.
                  </p>
                  <div className="text-xs text-muted-foreground">
                    <strong>Model Priority:</strong>
                    <br />1. Gemini 1.5 Pro (Advanced reasoning, research analysis)
                    <br />2. Gemini 1.5 Flash (Fast responses, efficient processing)
                    <br />3. Gemini Pro (Legacy fallback)
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'data' && (
              <div className="space-y-3">
                <div className="font-medium">Data Sources</div>
                <ul className="text-sm list-disc ml-5 opacity-90 space-y-1">
                  <li>ARGO Argovis (proxy via <code>/api/ocean/argo</code>)</li>
                  <li>NOAA Tides & Currents (proxy via <code>/api/ocean/tides</code>)</li>
                  <li>NASA Ocean Color (proxy via <code>/api/ocean/nasa</code>)</li>
                  <li>Marine Copernicus (proxy via <code>/api/ocean/copernicus</code>)</li>
                </ul>
                <p className="text-xs opacity-70">Notes: API credentials should be set in server environment variables. We do not store secrets in the browser.</p>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="space-y-4">
                <div className="font-medium">Profile</div>
                {profileLoading ? (
                  <div className="text-sm opacity-70">Loading profile…</div>
                ) : (
                  <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); saveProfile() }}>
                    <div>
                      <label className="block text-sm mb-1">Full name</label>
                      <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full rounded-md bg-transparent border border-white/15 px-3 py-2" />
                    </div>
                    <div>
                      <label className="block text-sm mb-1">Institution</label>
                      <input value={institution} onChange={(e) => setInstitution(e.target.value)} className="w-full rounded-md bg-transparent border border-white/15 px-3 py-2" />
                    </div>
                    <div>
                      <label className="block text-sm mb-1">Research area</label>
                      <input value={researchArea} onChange={(e) => setResearchArea(e.target.value)} className="w-full rounded-md bg-transparent border border-white/15 px-3 py-2" />
                    </div>
                    <div>
                      <label className="block text-sm mb-1">Expertise level</label>
                      <select
                        value={expertise}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                          const val = e.target.value as 'beginner' | 'intermediate' | 'advanced' | 'expert'
                          setExpertise(val)
                        }}
                        className="w-full rounded-md bg-transparent border border-white/15 px-3 py-2"
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                        <option value="expert">Expert</option>
                      </select>
                    </div>
                    <div className="pt-2">
                      <Button type="submit" size="sm" disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
