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

    // Get all final predictions for this match
    const { data: predictions, error } = await supabase
      .from('predictions')
      .select('predicted_team, is_final')
      .eq('match_id', matchId)

    if (error) throw error

    console.log(`Raw predictions for ${matchId}:`, predictions)

    // Filter for final predictions in JavaScript instead of SQL
    // Handle various possible values for is_final
    const finalPredictions = predictions?.filter((p: any) => {
      const isFinal = p.is_final === true || 
                      p.is_final === 'true' || 
                      p.is_final === 1 || 
                      p.is_final === '1' ||
                      String(p.is_final).toLowerCase() === 'true'
      console.log(`Prediction: ${p.predicted_team}, is_final value: "${p.is_final}" (type: ${typeof p.is_final}), isFinal: ${isFinal}`)
      return isFinal
    }) || []

    console.log(`Final predictions count for ${matchId}:`, finalPredictions.length)

    if (finalPredictions.length === 0) {
      return NextResponse.json({
        total: 0,
        teamCounts: {}
      })
    }

    // Count predictions per team
    const teamCounts: { [key: string]: number } = {}
    finalPredictions.forEach((p: any) => {
      teamCounts[p.predicted_team] = (teamCounts[p.predicted_team] || 0) + 1
    })

    const total = finalPredictions.length

    return NextResponse.json({
      total,
      teamCounts
    })
  } catch (error: any) {
    console.error('Match stats error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
