import { NextRequest, NextResponse } from 'next/server'
import * as cheerio from 'cheerio'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const url = searchParams.get('url')
    if (!url) return NextResponse.json({ error: 'Missing url' }, { status: 400 })

    const res = await fetch(url, {
      headers: {
        'user-agent': 'OceoChatBot/1.0 (+https://oceochat.example)'
      }
    })
    if (!res.ok) return NextResponse.json({ error: `Fetch failed: ${res.status}` }, { status: 502 })

    const html = await res.text()
    const $ = cheerio.load(html)

    const title = $('title').first().text().trim() || $('h1').first().text().trim()

    // Basic extraction: remove script/style/nav/footer, get main text
    $('script, style, nav, footer, noscript').remove()
    const main = $('main').text().trim() || $('article').text().trim() || $('body').text().trim()
    const text = main.replace(/\s+/g, ' ').replace(/\n\s+/g, '\n').trim()

    return NextResponse.json({ title, text, length: text.length })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
