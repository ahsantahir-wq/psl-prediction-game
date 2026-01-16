export interface Match {
  id: string
  team_a: string
  team_b: string
  match_date: string
  status: 'upcoming' | 'live' | 'completed'
  current_over?: number
  current_score_a?: number
  current_score_b?: number
  batting_team?: 'team_a' | 'team_b'
  created_at: string
}

export interface Prediction {
  id: string
  user_id: string
  match_id: string
  action_type: 'over_outcome' | 'boundary_rush' | 'wicket_window'
  prediction_data: any
  credits_spent: number
  status: 'pending' | 'won' | 'lost'
  credits_won?: number
  resolved_at?: string
  created_at: string
}

export interface MicroAction {
  id: string
  name: string
  icon: string
  description: string
  cost: number
  potentialWin: number
  type: 'over_outcome' | 'boundary_rush' | 'wicket_window'
}
