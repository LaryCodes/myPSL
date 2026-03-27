import { NextResponse } from 'next/server'
import { calculateLeaderboard } from '@/lib/leaderboard'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    console.log('Leaderboard API called')
    const leaderboard = await calculateLeaderboard()
    console.log(`Returning ${leaderboard.length} entries`)
    
    return NextResponse.json(leaderboard, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error: any) {
    console.error('Leaderboard API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to calculate leaderboard' }, 
      { status: 500 }
    )
  }
}
