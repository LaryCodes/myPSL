import { NextResponse } from 'next/server'
import { getAllMatchesWithStatus } from '@/lib/matches'

export async function GET() {
  try {
    const matches = getAllMatchesWithStatus()
    return NextResponse.json(matches)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
