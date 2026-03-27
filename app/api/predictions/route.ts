import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getMatchWithStatus } from '@/lib/matches'

export async function POST(request: NextRequest) {
  try {
    const { match_id, predicted_team } = await request.json()

    // Try to get token from cookie first, then from Authorization header
    let token = request.cookies.get('sb-access-token')?.value
    
    if (!token) {
      const authHeader = request.headers.get('authorization')
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.substring(7)
      }
    }

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized - No token found' }, { status: 401 })
    }

    // Create authenticated Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      }
    )

    // Verify the token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({ error: `Unauthorized - ${authError?.message || 'Invalid token'}` }, { status: 401 })
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

    if (existing) {
      return NextResponse.json({ error: 'Prediction already exists' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('predictions')
      .insert({
        user_id: user.id,
        match_id,
        predicted_team,
        is_final: true,
        edit_count: 0
      })
      .select()
      .single()

    if (error) {
      console.error('Insert error:', error)
      throw error
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
