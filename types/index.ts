export interface Match {
  id: string
  team_a: string
  team_b: string
  venue: string
  match_date: string
  status: 'upcoming' | 'live' | 'completed'
  current_over?: number
  current_score_a?: number
  current_score_b?: number
  current_wickets_a?: number
  current_wickets_b?: number
  batting_team?: string
  team_a_logo?: string
  team_b_logo?: string
  ball_history?: any
  innings?: number
  ball_number?: number
  last_ball_runs?: number
  last_ball_event?: string | null
  is_favorite?: boolean
}

export interface Wallet {
  id: string
  user_id: string
  balance: number
  created_at: string
  updated_at: string
}

export interface Prediction {
  id: string
  user_id: string
  match_id: string
  micro_action: string
  stake: number
  predicted_outcome: string
  actual_outcome?: string
  status: 'pending' | 'won' | 'lost'
  payout?: number
  created_at: string
}

export interface UserStats {
  id: string
  user_id: string
  username: string
  total_predictions: number
  won_predictions: number
  lost_predictions: number
  total_winnings: number
  accuracy_rate: number
  rank?: number
}

// User Favorites
export interface UserFavorite {
  id: string
  user_id: string
  match_id: string
  created_at: string
}

// ✅ Add this MicroAction interface
export interface MicroAction {
  id: string
  name: string
  description: string
  cost: number
  potentialWin: number
  type: string
  icon: string
}
