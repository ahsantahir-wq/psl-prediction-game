export interface User {
  id: string
  email: string
  wallet_balance: number
  total_predictions: number
  correct_predictions: number
  accuracy: number
  current_streak: number
  best_streak: number
  cricket_iq_level: number
  created_at: string
}

export interface Player {
  id: string
  name: string
  team_id: string | null
  role: string
  batting_style?: string | null
  bowling_style?: string | null
  is_overseas?: boolean
  bat_innings?: number
  bat_runs?: number
  bat_balls_faced?: number
  bat_fours?: number
  bat_sixes?: number
  bat_high_score?: number
  bat_strike_rate?: number
  bat_average?: number
  bowl_innings?: number
  bowl_overs?: number
  bowl_runs?: number
  bowl_wickets?: number
  bowl_dots?: number
  bowl_economy?: number
  bowl_average?: number
  catches?: number
  stumpings?: number
  bat_bucket?: string | null
  bowl_bucket?: string | null
  fantasy_role?: string | null
  value_score?: number
  risk_band?: string | null
  is_consistent?: boolean
  is_high_sr?: boolean
  is_wicket_threat?: boolean
  is_economy_king?: boolean
  is_all_round_package?: boolean
  is_out?: boolean
  current_batsman?: boolean
  current_bowler?: boolean
  created_at?: string
  updated_at?: string
}

export interface Team {
  id: string
  name: string
  logo_url?: string
  created_at: string
}

export interface Match {
  id: string
  team_a_id?: string
  team_b_id?: string
  team_a?: string | Team
  team_b?: string | Team
  venue?: string
  match_date: string
  status: 'upcoming' | 'live' | 'completed'
  current_over?: number
  current_ball?: number
  ball_number?: number
  team_a_score?: number
  team_b_score?: number
  team_a_wickets?: number
  team_b_wickets?: number
  current_score_a?: number
  current_score_b?: number
  current_wickets_a?: number
  current_wickets_b?: number
  batting_team?: string | 'a' | 'b'
  team_a_logo?: string
  team_b_logo?: string
  ball_history?: any
  innings?: number
  last_ball_runs?: number
  last_ball_event?: string | null
  is_favorite?: boolean
  live_events?: any
  ball_by_ball?: any
  created_at: string
}

export interface Prediction {
  id: string
  user_id: string
  match_id: string
  match?: Match
  type: string
  prediction: string
  stake: number
  potential_return: number
  status: 'pending' | 'won' | 'lost'
  over_number?: number
  ball_number?: number
  resolved_at?: string
  created_at: string
}
