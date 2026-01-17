export interface Match {
  id: string
  team_a: string
  team_b: string
  team_a_logo: string
  team_b_logo: string
  date: string
  status: 'upcoming' | 'live' | 'completed'
  score?: {
    team_a: { runs: number; wickets: number; overs: number }
    team_b: { runs: number; wickets: number; overs: number }
  }
  current_over?: number
  current_ball?: number
  batting_team?: 'team_a' | 'team_b'
  current_score_a?: number
  current_score_b?: number
  current_wickets_a?: number
  current_wickets_b?: number
  ball_number?: number
  last_ball_runs?: number
  last_ball_event?: string | null
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
