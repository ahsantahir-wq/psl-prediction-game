import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    // 1. Get live matches
    const { data: matches } = await supabase
      .from('matches')
      .select('*')
      .eq('status', 'live')
      .lt('ball_number', 120)

    if (!matches || matches.length === 0) {
      return NextResponse.json({ message: 'No live matches found' })
    }

    console.log('Found live matches:', matches.length)

    for (const match of matches) {
      // 2. Simulate next ball with better odds for testing
      const outcomes = [0, 0, 1, 2, 4, 6, 'W', 4, 6] // More boundaries for testing
      const runs = outcomes[Math.floor(Math.random() * outcomes.length)]
      const isWicket = runs === 'W'
      const ballRuns = isWicket ? 0 : (runs as number)
      
      const nextBall = match.ball_number + 1
      const nextScore = match.current_score_a + ballRuns
      const nextWickets = match.current_wickets_a + (isWicket ? 1 : 0)

      let ballEvent = ''
      if (isWicket) ballEvent = '🔴 Wicket!'
      else if (ballRuns === 6) ballEvent = '⭐ Six!'
      else if (ballRuns === 4) ballEvent = '🎯 Four!'
      else if (ballRuns === 0) ballEvent = '⚪ Dot Ball'
      else ballEvent = `${ballRuns} Run${ballRuns > 1 ? 's' : ''}`

      console.log(`Ball ${nextBall}: ${ballEvent}`)

      // 3. Update match
      await supabase.from('matches').update({
        ball_number: nextBall,
        current_score_a: nextScore,
        current_wickets_a: nextWickets,
        last_ball_runs: ballRuns,
        last_ball_event: ballEvent,
        status: (nextBall >= 120 || nextWickets >= 10) ? 'completed' : 'live'
      }).eq('id', match.id)

      // 4. Resolve predictions for this ball
      const { data: predictions } = await supabase
        .from('predictions')
        .select('*')
        .eq('match_id', match.id)
        .eq('status', 'pending')

      console.log(`Checking ${predictions?.length || 0} predictions...`)

      if (predictions && predictions.length > 0) {
        for (const pred of predictions) {
          let isWinner = false
          
          console.log(`Prediction: ${pred.action_type} = ${pred.predicted_outcome}`)
          
          // Match action_type and predicted_outcome with ball event
          if (pred.action_type === 'over_outcome') {
            if (pred.predicted_outcome === '0-6' && ballRuns <= 6) isWinner = true
            if (pred.predicted_outcome === '7-12' && ballRuns >= 7 && ballRuns <= 12) isWinner = true
            if (pred.predicted_outcome === '13+' && ballRuns >= 13) isWinner = true
          }
          
          if (pred.action_type === 'boundary_rush') {
            if (pred.predicted_outcome === 'yes' && (ballRuns === 4 || ballRuns === 6)) {
              isWinner = true
            }
            if (pred.predicted_outcome === 'no' && ballRuns !== 4 && ballRuns !== 6 && !isWicket) {
              isWinner = true
            }
          }
          
          if (pred.action_type === 'wicket_window') {
            if (pred.predicted_outcome === 'yes' && isWicket) {
              isWinner = true
            }
            if (pred.predicted_outcome === 'no' && !isWicket) {
              isWinner = true
            }
          }

          if (isWinner) {
            console.log(`✅ WINNER! User ${pred.user_id} won ${pred.potential_payout} credits`)
            
            // Mark prediction as won
            await supabase
              .from('predictions')
              .update({ status: 'won', resolved_at: new Date().toISOString() })
              .eq('id', pred.id)
            
            // Update wallet
            const { data: wallet } = await supabase
              .from('wallet')
              .select('balance')
              .eq('user_id', pred.user_id)
              .single()
            
            if (wallet) {
              await supabase
                .from('wallet')
                .update({ balance: wallet.balance + pred.potential_payout })
                .eq('user_id', pred.user_id)
            }
            
            // Update user stats
            await supabase.rpc('increment_stats', {
              p_user_id: pred.user_id,
              p_win: true
            })
          } else {
            // Mark as lost after ball is played
            console.log(`❌ Lost prediction for user ${pred.user_id}`)
            await supabase
              .from('predictions')
              .update({ status: 'lost', resolved_at: new Date().toISOString() })
              .eq('id', pred.id)
            
            // Update user stats
            await supabase.rpc('increment_stats', {
              p_user_id: pred.user_id,
              p_win: false
            })
          }
        }
      }
    }

    return NextResponse.json({ success: true, message: 'Simulation complete' })
  } catch (error) {
    console.error('Simulation error:', error)
    return NextResponse.json({ error: 'Simulation failed' }, { status: 500 })
  }
}
