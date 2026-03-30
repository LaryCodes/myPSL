import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const LOCK_DATETIME = '2026-04-28T14:00:00Z' // Qualifier 1 start time

export async function GET(request: NextRequest) {
  try {
    // Try to get token from cookie first, then from Authorization header
    let token = request.cookies.get('sb-access-token')?.value
    
    if (!token) {
      const authHeader = request.headers.get('authorization')
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.substring(7)
      }
    }

    if (!token) {
      console.log('No token found in cookies or headers')
      return NextResponse.json({ error: 'Unauthorized - No token found' }, { status: 401 })
    }

    console.log('Token found, length:', token.length)

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    )

    // Pass token as parameter to getUser
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError) {
      console.log('Auth error:', authError.message)
      return NextResponse.json({ error: `Unauthorized - ${authError.message}` }, { status: 401 })
    }
    
    if (!user) {
      console.log('No user returned from getUser')
      return NextResponse.json({ error: 'Unauthorized - No user' }, { status: 401 })
    }

    console.log('User authenticated:', user.id)

    // Check if locked
    const now = new Date()
    const lockTime = new Date(LOCK_DATETIME)
    const isLocked = now >= lockTime
    const timeUntilLock = lockTime.getTime() - now.getTime()

    // Get user's prediction
    const { data: prediction } = await supabase
      .from('ultimate_predictions')
      .select('*')
      .eq('user_id', user.id)
      .single()

    return NextResponse.json({
      prediction: prediction || null,
      isLocked,
      timeUntilLock: Math.max(0, timeUntilLock),
      lockDatetime: LOCK_DATETIME
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { finalist_team1, finalist_team2, champion_team } = await request.json()

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

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    )

    // Pass token as parameter to getUser
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized - Invalid token' }, { status: 401 })
    }

    // Check if locked
    const now = new Date()
    const lockTime = new Date(LOCK_DATETIME)
    if (now >= lockTime) {
      return NextResponse.json({ error: 'Predictions are locked' }, { status: 400 })
    }

    // Validate inputs
    if (!finalist_team1 || !finalist_team2) {
      return NextResponse.json({ error: 'Both finalist teams required' }, { status: 400 })
    }

    if (finalist_team1 === finalist_team2) {
      return NextResponse.json({ error: 'Finalist teams must be different' }, { status: 400 })
    }

    if (champion_team && champion_team !== finalist_team1 && champion_team !== finalist_team2) {
      return NextResponse.json({ error: 'Champion must be one of your finalists' }, { status: 400 })
    }

    // Upsert prediction
    const { data, error } = await supabase
      .from('ultimate_predictions')
      .upsert({
        user_id: user.id,
        finalist_team1,
        finalist_team2,
        champion_team: champion_team || null,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
