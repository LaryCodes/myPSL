import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getMatchWithStatus } from '@/lib/matches'

export async function PUT(request: NextRequest) {
  try {
    const { match_id, predicted_team } = await request.json()

    // Get user from session token (SECURE)
    const token = request.cookies.get('sb-access-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Validate inputs
    if (!match_id || !predicted_team) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const match = getMatchWithStatus(match_id)
    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 })
    }

    if (!match.prediction_open) {
      return NextResponse.json({ error: 'Prediction window closed' }, { status: 400 })
    }

    // Validate team is valid for this match
    if (predicted_team !== match.team1 && predicted_team !== match.team2) {
      return NextResponse.json({ error: 'Invalid team for this match' }, { status: 400 })
    }

    const { data: existing } = await supabase
      .from('predictions')
      .select('*')
      .eq('user_id', user.id)
      .eq('match_id', match_id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'No prediction found' }, { status: 404 })
    }

    if (existing.edit_count >= 2) {
      return NextResponse.json({ error: 'Maximum edits reached' }, { status: 400 })
    }

    // Prevent editing to same team (pointless)
    if (existing.predicted_team === predicted_team) {
      return NextResponse.json({ error: 'Same team selected' }, { status: 400 })
    }

    await supabase.from('prediction_history').insert({
      prediction_id: existing.id,
      previous_team: existing.predicted_team,
    })

    const { data, error } = await supabase
      .from('predictions')
      .update({
        predicted_team,
        edit_count: existing.edit_count + 1
      })
      .eq('id', existing.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
