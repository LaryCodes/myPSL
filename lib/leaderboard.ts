import { supabase, Prediction, User } from './supabase'
import { getMatches } from './matches'

export type LeaderboardEntry = {
  user_id: string
  name: string
  total_points: number
  current_streak: number
  max_streak: number
  rank: number
}

export async function calculateLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    const matches = getMatches().sort((a, b) => 
      new Date(a.match_datetime).getTime() - new Date(b.match_datetime).getTime()
    )

    // Fetch all profiles with error handling
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: true })

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError)
      return []
    }

    if (!profiles || profiles.length === 0) {
      console.log('No profiles found')
      return []
    }

    console.log(`Found ${profiles.length} profiles`)

    // Fetch all predictions with error handling
    const { data: predictions, error: predictionsError } = await supabase
      .from('predictions')
      .select('*')
      .eq('is_final', true)

    if (predictionsError) {
      console.error('Error fetching predictions:', predictionsError)
      return []
    }

    console.log(`Found ${predictions?.length || 0} predictions`)

    const leaderboard: LeaderboardEntry[] = profiles.map((profile: any) => {
      let totalPoints = 0
      let currentStreak = 0
      let maxStreak = 0

      matches.forEach(match => {
        const prediction = predictions?.find(
          (p: any) => p.user_id === profile.id && p.match_id === match.match_id
        )

        // Skip matches that haven't been played yet
        if (!match.result) {
          return
        }

        // Handle abandoned/no-result matches
        if (match.result === 'no_result') {
          if (prediction) {
            totalPoints += 1
          }
          // Streak unchanged
          return
        }

        if (!prediction) {
          // No prediction - reset streak
          currentStreak = 0
          return
        }

        if (prediction.predicted_team === match.result) {
          // Correct prediction
          totalPoints += 2
          currentStreak++
          
          // Streak bonus: ONLY at exactly 3 consecutive
          if (currentStreak === 3) {
            totalPoints += 1
          }
          
          maxStreak = Math.max(maxStreak, currentStreak)
        } else {
          // Wrong prediction
          currentStreak = 0
        }
      })

      return {
        user_id: profile.id,
        name: profile.name || 'Unknown',
        total_points: totalPoints,
        current_streak: currentStreak,
        max_streak: maxStreak,
        rank: 0
      }
    })

    // Sort by points descending
    leaderboard.sort((a, b) => b.total_points - a.total_points)

    // Assign ranks (same points = same rank)
    let currentRank = 1
    for (let i = 0; i < leaderboard.length; i++) {
      if (i > 0 && leaderboard[i].total_points < leaderboard[i - 1].total_points) {
        currentRank = i + 1
      }
      leaderboard[i].rank = currentRank
    }

    console.log(`Leaderboard calculated: ${leaderboard.length} entries`)
    return leaderboard
  } catch (error) {
    console.error('Fatal error in calculateLeaderboard:', error)
    return []
  }
}
