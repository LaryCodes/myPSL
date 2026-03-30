import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const matchId = searchParams.get('match_id')

    if (!matchId) {
      return NextResponse.json({ error: 'match_id required' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Get all predictions for this match
    const { data: predictions, error } = await supabase
      .from('predictions')
      .select('predicted_team')
      .eq('match_id', matchId)
      .eq('is_final', true)

    if (error) throw error

    if (!predictions || predictions.length === 0) {
      return NextResponse.json({
        total: 0,
        team1Count: 0,
        team2Count: 0,
        team1Percentage: 0,
        team2Percentage: 0
      })
    }

    // Count predictions per team
    const teamCounts: { [key: string]: number } = {}
    predictions.forEach((p: any) => {
      teamCounts[p.predicted_team] = (teamCounts[p.predicted_team] || 0) + 1
    })

    const teams = Object.keys(teamCounts)
    const team1 = teams[0] || ''
    const team2 = teams[1] || ''
    const team1Count = teamCounts[team1] || 0
    const team2Count = teamCounts[team2] || 0
    const total = predictions.length

    const team1Percentage = total > 0 ? Math.round((team1Count / total) * 100) : 0
    const team2Percentage = total > 0 ? Math.round((team2Count / total) * 100) : 0

    return NextResponse.json({
      total,
      team1Count,
      team2Count,
      team1Percentage,
      team2Percentage,
      teamCounts
    })
  } catch (error: any) {
    console.error('Match stats error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
