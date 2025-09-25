import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

interface SearchResult {
  title: string
  link: string
  snippet?: string
  source: 'serpapi' | 'duckduckgo'
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q')?.trim()
    if (!q) return NextResponse.json({ error: 'Missing q' }, { status: 400 })

    const serpKey = process.env.SERPAPI_KEY

    if (serpKey) {
      // SerpAPI Google Search
      const params = new URLSearchParams({
        engine: 'google',
        q,
        api_key: serpKey,
        num: '10',
        hl: 'en',
      })
      const r = await fetch(`https://serpapi.com/search.json?${params.toString()}`)
      if (r.ok) {
        const data = await r.json()
        const results: SearchResult[] = (data.organic_results || []).map((it: any) => ({
          title: it.title,
          link: it.link,
          snippet: it.snippet,
          source: 'serpapi'
        }))
        return NextResponse.json({ query: q, results })
      }
      // if SerpAPI fails, fall through to DDG
    }

    // DuckDuckGo Instant Answer fallback (limited)
    const ddg = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(q)}&format=json&no_html=1&skip_disambig=1`)
    if (!ddg.ok) return NextResponse.json({ error: 'Search failed' }, { status: 502 })
    const ddgJson = await ddg.json()

    const related: SearchResult[] = Array.isArray(ddgJson.RelatedTopics)
      ? ddgJson.RelatedTopics.flatMap((t: any) => {
          if (t.Topics) {
            return t.Topics.map((s: any) => ({
              title: s.Text || s.Result?.replace(/<[^>]+>/g, '') || 'Result',
              link: s.FirstURL,
              snippet: s.Text,
              source: 'duckduckgo' as const,
            }))
          }
          return [{
            title: t.Text || t.Result?.replace(/<[^>]+>/g, '') || 'Result',
            link: t.FirstURL,
            snippet: t.Text,
            source: 'duckduckgo' as const,
          }]
        })
      : []

    return NextResponse.json({ query: q, results: related })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
