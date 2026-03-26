export type Match = {
  match_id: string
  team1: string
  team2: string
  match_datetime: string
  result: string | null
}

export type MatchWithStatus = Match & {
  prediction_open: boolean
  prediction_closed: boolean
  time_until_lock: number
}

export type User = {
  id: string
  email: string
  created_at: string
}

export type Prediction = {
  id: string
  user_id: string
  match_id: string
  predicted_team: string
  created_at: string
  is_final: boolean
  edit_count: number
}

export type PredictionHistory = {
  id: string
  prediction_id: string
  previous_team: string
  updated_at: string
}

export type LeaderboardEntry = {
  user_id: string
  email: string
  total_points: number
  current_streak: number
  max_streak: number
  rank: number
}
