import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type User = {
  id: string
  email: string
  created_at: string
}

export type UserProfile = {
  id: string
  name: string
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
