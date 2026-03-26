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
  const matches = getMatches().sort((a, b) => 
    new Date(a.match_datetime).getTime() - new Date(b.match_datetime).getTime()
  )

  const { data: profiles } = await supabase.from('user_profiles').select('*')
  const { data: predictions } = await supabase
    .from('predictions')
    .select('*')
    .eq('is_final', true)

  if (!profiles || !predictions) return []

  const leaderboard: LeaderboardEntry[] = profiles.map((profile: any) => {
    let totalPoints = 0
    let currentStreak = 0
    let maxStreak = 0

    matches.forEach(match => {
      const prediction = predictions.find(
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
      name: profile.name,
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

  return leaderboard
}
