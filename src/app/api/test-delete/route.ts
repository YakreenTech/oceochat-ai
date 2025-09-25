import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ message: 'DELETE test endpoint working' })
}

export async function DELETE() {
  return NextResponse.json({ ok: true, message: 'DELETE method works' })
}
