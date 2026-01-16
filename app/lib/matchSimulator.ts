import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

export interface BallOutcome {
  runs: number
  isWicket: boolean
  isBoundary: boolean
  event: string
}

// Weighted outcomes for realistic cricket
const WEIGHTED_OUTCOMES: BallOutcome[] = [
  ...Array(30).fill({ runs: 0, isWicket: false, isBoundary: false, event: 'Dot ball' }),
  ...Array(20).fill({ runs: 1, isWicket: false, isBoundary: false, event: 'Single' }),
  ...Array(10).fill({ runs: 2, isWicket: false, isBoundary: false, event: 'Two runs' }),
  ...Array(8).fill({ runs: 4, isWicket: false, isBoundary: true, event: 'FOUR! 🎯' }),
  ...Array(3).fill({ runs: 6, isWicket: false, isBoundary: true, event: 'SIX! 🚀' }),
  ...Array(4).fill({ runs: 0, isWicket: true, isBoundary: false, event: 'WICKET! 🔥' }),
  ...Array(15).fill({ runs: 1, isWicket: false, isBoundary: false, event: 'Quick single' }),
]

function getRandomBall(): BallOutcome {
  return WEIGHTED_OUTCOMES[Math.floor(Math.random() * WEIGHTED_OUTCOMES.length)]
}

export async function simulateBall(matchId: string) {
  // Get current match state
  const { data: match } = await supabase
    .from('matches')
    .select('*')
    .eq('id', matchId)
    .eq('status', 'live')
    .single()

  if (!match) return null

  const ball = getRandomBall()
  
  const newBallNumber = (match.ball_number || 0) + 1
  const newOver = Math.floor(newBallNumber / 6)
  const newScore = (match.current_score_a || 0) + ball.runs
  const newWickets = (match.current_wickets_a || 0) + (ball.isWicket ? 1 : 0)

  // Update match
  await supabase
    .from('matches')
    .update({
      current_over: newOver,
      current_score_a: newScore,
      current_wickets_a: newWickets,
      ball_number: newBallNumber,
      last_ball_runs: ball.runs,
      last_ball_event: ball.event
    })
    .eq('id', matchId)

  // Resolve predictions for this ball - PASS match object
  await resolvePredictions(matchId, match, ball)

  // End match after 20 overs or 10 wickets
  if (newOver >= 20 || newWickets >= 10) {
    await supabase
      .from('matches')
      .update({ status: 'completed' })
      .eq('id', matchId)
  }

  return { match, ball, newOver, newScore, newWickets }
}

// 🔥 FIXED: Added 'match' parameter
async function resolvePredictions(matchId: string, match: any, ball: BallOutcome) {
  // Get pending predictions for this match
  const { data: predictions } = await supabase
    .from('predictions')
    .select('*')
    .eq('match_id', matchId)
    .eq('status', 'pending')

  if (!predictions || predictions.length === 0) return

  for (const prediction of predictions) {
    let won = false
    let shouldResolve = false

    switch (prediction.action_type) {
      case 'boundary_rush':
        // Resolve immediately
        shouldResolve = true
        if (prediction.prediction_data?.option === 'yes' && ball.isBoundary) {
          won = true
        } else if (prediction.prediction_data?.option === 'no' && !ball.isBoundary) {
          won = true
        }
        break

      case 'wicket_window':
        // Resolve if wicket falls
        if (ball.isWicket && prediction.prediction_data?.option === 'yes') {
          won = true
          shouldResolve = true
        }
        // Resolve after 6 balls if no wicket - NOW 'match' exists!
        const ballsSincePrediction = (match.ball_number || 0) - (prediction.prediction_data?.ball_number || 0)
        if (ballsSincePrediction >= 6) {
          shouldResolve = true
          won = false
        }
        break

      case 'over_outcome':
        // Resolve at end of over
        if ((match.ball_number || 0) % 6 === 0) {
          shouldResolve = true
          const overRuns = ball.runs // Simplified - would need to track full over
          if (prediction.prediction_data?.option === 'high' && overRuns >= 8) {
            won = true
          } else if (prediction.prediction_data?.option === 'medium' && overRuns >= 4 && overRuns < 8) {
            won = true
          } else if (prediction.prediction_data?.option === 'low' && overRuns < 4) {
            won = true
          }
        }
        break
    }

    if (shouldResolve) {
      await supabase
        .from('predictions')
        .update({
          status: won ? 'won' : 'lost',
          credits_won: won ? prediction.potential_win : 0,
          resolved_at: new Date().toISOString()
        })
        .eq('id', prediction.id)

      if (won) {
        // Award credits
        const { data: wallet } = await supabase
          .from('wallet')
          .select('credits_balance')
          .eq('user_id', prediction.user_id)
          .single()

        if (wallet) {
          await supabase
            .from('wallet')
            .update({
              credits_balance: wallet.credits_balance + prediction.potential_win
            })
            .eq('user_id', prediction.user_id)

          // Update stats
          const { data: stats } = await supabase
            .from('user_stats')
            .select('*')
            .eq('user_id', prediction.user_id)
            .single()

          if (stats) {
            await supabase
              .from('user_stats')
              .update({
                correct_predictions: stats.correct_predictions + 1,
                credits_won: stats.credits_won + prediction.potential_win
              })
              .eq('user_id', prediction.user_id)
          }
        }
      }
    }
  }
}
