export interface Match {
  id: string
  team_a: string
  team_b: string
  venue: string
  match_date: string
  status: 'upcoming' | 'live' | 'completed'
  current_over: number
  current_score_a: number
  current_score_b: number
  current_wickets_a: number
  current_wickets_b: number
  batting_team: 'team_a' | 'team_b'
}

export interface Wallet {
  user_id: string
  credits_balance: number
  total_predictions: number
  total_won: number
  accuracy_rate: number
  skill_score: number
}

export interface Prediction {
  id: string
  user_id: string
  match_id: string
  action_type: string
  prediction_data: any
  credits_spent: number
  status: 'pending' | 'won' | 'lost'
  credits_won: number
  created_at: string
}

export interface UserStats {
  user_id: string
  total_predictions: number
  correct_predictions: number
  accuracy_rate: number
  total_credits_won: number
  current_streak: number
  best_streak: number
  rank: number
}