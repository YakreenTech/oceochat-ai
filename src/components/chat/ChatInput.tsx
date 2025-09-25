"use client"
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

// Minimal typings for Web Speech API (to avoid any)
type SpeechRecognitionResultItem = { transcript: string }
type SpeechRecognitionResult = { 0: SpeechRecognitionResultItem }
type SpeechRecognitionResultList = ArrayLike<SpeechRecognitionResult>
type SpeechRecognitionEvent = { resultIndex: number; results: SpeechRecognitionResultList }
interface ISpeechRecognition {
  lang: string
  interimResults: boolean
  continuous: boolean
  onresult: (e: SpeechRecognitionEvent) => void
  onend: () => void
  onerror: (e: unknown) => void
  start: () => void
  stop: () => void
}
declare global {
  interface Window {
    webkitSpeechRecognition?: { new (): ISpeechRecognition }
    SpeechRecognition?: { new (): ISpeechRecognition }
    __oceo_recog?: ISpeechRecognition
  }
}

type Template = { id: string; label: string; text: string }

export function ChatInput({ onSend, disabled }: { onSend: (msg: string) => void; disabled?: boolean }) {
  const [value, setValue] = useState("")
  const taRef = useRef<HTMLTextAreaElement>(null)
  const [listening, setListening] = useState(false)
  const [charCount, setCharCount] = useState(0)

  const templates = useMemo<Template[]>(() => ([
    { id: 'argo-nearby', label: 'ARGO near location', text: 'Find ARGO float profiles near 18.9N, 72.8E in the last 14 days. Summarize temperature and salinity anomalies.' },
    { id: 'chlorophyll-trend', label: 'Chlorophyll trend', text: 'Analyze chlorophyll-a trends from NASA Ocean Color for the Arabian Sea over the past month and suggest visualizations.' },
    { id: 'tides-station', label: 'NOAA tides', text: 'Get predicted tides for station 9410230 today and summarize high/low events in local time.' },
  ]), [])

  useEffect(() => { setCharCount(value.length) }, [value])

  const submit = useCallback(() => {
    if (!value.trim() || disabled) return
    onSend(value.trim())
    setValue("")
    if (taRef.current) { taRef.current.style.height = 'auto' }
  }, [value, disabled, onSend])

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  const onInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const ta = e.currentTarget
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 200) + 'px'
  }

  // Web Speech API dictation
  const startStopDictation = () => {
    const w = window as Window
    const SpeechRecognition = w.SpeechRecognition || w.webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert('Speech recognition not supported in this browser.')
      return
    }
    if (listening) {
      w.__oceo_recog?.stop?.()
      setListening(false)
      return
    }
    const recog = new SpeechRecognition()
    w.__oceo_recog = recog
    recog.lang = 'en-US'
    recog.interimResults = true
    recog.continuous = false
    recog.onresult = (e: SpeechRecognitionEvent) => {
      let transcript = ''
      for (let i = e.resultIndex; i < e.results.length; ++i) {
        transcript += e.results[i][0].transcript
      }
      setValue(prev => (prev ? prev + ' ' : '') + transcript.trim())
    }
    recog.onend = () => setListening(false)
    recog.onerror = () => setListening(false)
    setListening(true)
    recog.start()
  }

  const applyTemplate = (t: Template) => setValue(t.text)
  const clear = () => setValue('')

  return (
    <div className="rounded-md border border-white/15 bg-[#40414f] focus-within:border-white/25" aria-label="Message composer">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-2 pt-2 text-xs text-white/70">
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              className="px-2 py-1 rounded hover:bg-white/10"
              aria-haspopup="listbox"
              aria-label="Insert template"
              onClick={(e) => {
                const menu = (e.currentTarget.nextSibling as HTMLDivElement | null)
                if (menu) menu.classList.toggle('hidden')
              }}
            >
              + Templates
            </button>
            <div className="absolute z-10 mt-1 w-80 hidden bg-[#30313a] border border-white/10 rounded shadow">
              {templates.map(t => (
                <button
                  key={t.id}
                  className="block w-full text-left px-3 py-2 hover:bg-white/10"
                  onClick={(e) => {
                    applyTemplate(t)
                    const container = (e.currentTarget.parentElement as HTMLDivElement)
                    container.classList.add('hidden')
                  }}
                >
                  <div className="font-medium">{t.label}</div>
                  <div className="text-xs opacity-70 line-clamp-2">{t.text}</div>
                </button>
              ))}
            </div>
          </div>

          <button
            className={`px-2 py-1 rounded ${listening ? 'bg-red-600' : 'hover:bg-white/10'}`}
            onClick={startStopDictation}
            aria-pressed={listening}
            aria-label={listening ? 'Stop voice input' : 'Start voice input'}
          >
            {listening ? 'Stop Mic' : 'Mic'}
          </button>

          <button className="px-2 py-1 rounded hover:bg-white/10" onClick={clear} aria-label="Clear input">Clear</button>
        </div>
        <div aria-live="polite">{charCount} chars</div>
      </div>

      {/* Input and send */}
      <div className="flex items-end gap-2 p-2">
        <Textarea
          ref={taRef}
          rows={1}
          className="flex-1"
          placeholder="Message OceoChat"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          onInput={onInput}
          disabled={disabled}
          aria-label="Message input"
        />
        <Button
          type="button"
          onClick={submit}
          disabled={disabled || !value.trim()}
          variant="default"
          size="sm"
          aria-label="Send message"
        >
          Send
        </Button>
      </div>
    </div>
  )
}
