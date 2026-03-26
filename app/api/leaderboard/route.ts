import { NextResponse } from 'next/server'
import { calculateLeaderboard } from '@/lib/leaderboard'

export async function GET() {
  try {
    const leaderboard = await calculateLeaderboard()
    return NextResponse.json(leaderboard)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
