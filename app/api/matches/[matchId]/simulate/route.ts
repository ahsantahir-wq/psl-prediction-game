import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
  try {
    const { matchId } = await params; // ← Fixed: Now awaiting params
    
    console.log('Starting simulation for match:', matchId)

    // Fetch the match
    const { data: match, error: fetchError } = await supabase
      .from('matches')
      .select('*')
      .eq('id', matchId)
      .single()

    if (fetchError || !match) {
      console.error('Match not found:', fetchError)
      return NextResponse.json({ error: 'Match not found' }, { status: 404 })
    }

    console.log('Match found:', match.home_team, 'vs', match.away_team)

    // If match is already live or completed, don't start again
    if (match.status !== 'upcoming') {
      console.log('Match already started or completed')
      return NextResponse.json({ 
        message: 'Match simulation already running or completed',
        status: match.status 
      })
    }

    // Start the match simulation
    const { data: updatedMatch, error: updateError } = await supabase
      .from('matches')
      .update({
        status: 'live',
        current_ball: 0,
        total_balls: 120,
        home_score: 0,
        away_score: 0,
        home_wickets: 0,
        away_wickets: 0,
        current_over: 0.0,
        batting_team: match.home_team,
        updated_at: new Date().toISOString()
      })
      .eq('id', matchId)
      .select()
      .single()

    if (updateError) {
      console.error('Failed to start match:', updateError)
      return NextResponse.json({ error: 'Failed to start match' }, { status: 500 })
    }

    console.log('Match started successfully')

    // Start the ball-by-ball simulation
    simulateMatch(matchId)

    return NextResponse.json({ 
      message: 'Match simulation started',
      match: updatedMatch 
    })
  } catch (error) {
    console.error('Error starting match simulation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function simulateMatch(matchId: string) {
  let currentBall = 0
  const totalBalls = 120 // 20 overs

  const interval = setInterval(async () => {
    currentBall++

    // Fetch current match state
    const { data: match } = await supabase
      .from('matches')
      .select('*')
      .eq('id', matchId)
      .single()

    if (!match) {
      clearInterval(interval)
      return
    }

    // Simulate ball outcome
    const outcome = simulateBall()
    const currentOver = Math.floor((currentBall - 1) / 6) + ((currentBall - 1) % 6) / 10

    // Determine batting team
    const isBattingHome = currentBall <= 60
    const battingTeam = isBattingHome ? match.home_team : match.away_team

    // Update scores
    let homeScore = match.home_score || 0
    let awayScore = match.away_score || 0
    let homeWickets = match.home_wickets || 0
    let awayWickets = match.away_wickets || 0

    if (isBattingHome) {
      homeScore += outcome.runs
      if (outcome.isWicket) homeWickets++
    } else {
      awayScore += outcome.runs
      if (outcome.isWicket) awayWickets++
    }

    // Get current ball_by_ball data
    const ballByBall = match.ball_by_ball || []
    
    // Add new ball
    ballByBall.push({
      ball: currentBall,
      over: currentOver,
      runs: outcome.runs,
      isWicket: outcome.isWicket,
      isBoundary: outcome.isBoundary,
      battingTeam: battingTeam,
      timestamp: new Date().toISOString()
    })

    // Update match
    await supabase
      .from('matches')
      .update({
        current_ball: currentBall,
        current_over: currentOver,
        home_score: homeScore,
        away_score: awayScore,
        home_wickets: homeWickets,
        away_wickets: awayWickets,
        batting_team: battingTeam,
        ball_by_ball: ballByBall,
        updated_at: new Date().toISOString(),
        status: currentBall >= totalBalls ? 'completed' : 'live'
      })
      .eq('id', matchId)

    // Resolve predictions after each ball
    await resolvePredictions(matchId, currentBall, outcome)

    if (currentBall >= totalBalls) {
      clearInterval(interval)
      console.log('Match completed:', matchId)
    }
  }, 3000) // Every 3 seconds
}

function simulateBall() {
  const random = Math.random()
  let runs = 0
  let isWicket = false
  let isBoundary = false

  if (random < 0.1) {
    // 10% chance of wicket
    isWicket = true
  } else if (random < 0.25) {
    // 15% chance of boundary (4 or 6)
    runs = Math.random() < 0.7 ? 4 : 6
    isBoundary = true
  } else if (random < 0.5) {
    // 25% chance of 0 runs
    runs = 0
  } else if (random < 0.75) {
    // 25% chance of 1 run
    runs = 1
  } else if (random < 0.9) {
    // 15% chance of 2 runs
    runs = 2
  } else {
    // 10% chance of 3 runs
    runs = 3
  }

  return { runs, isWicket, isBoundary }
}

async function resolvePredictions(matchId: string, currentBall: number, outcome: any) {
  // Fetch pending predictions for this match and ball
  const { data: predictions } = await supabase
    .from('predictions')
    .select('*')
    .eq('match_id', matchId)
    .eq('status', 'pending')

  if (!predictions || predictions.length === 0) return

  for (const prediction of predictions) {
    let resolved = false
    let won = false

    // Check prediction type and resolve
    if (prediction.prediction_type === 'over_outcome') {
      const targetOver = prediction.prediction_data?.over
      const predictedOutcome = prediction.prediction_data?.outcome
      const currentOver = Math.floor((currentBall - 1) / 6)

      if (currentOver === targetOver && currentBall % 6 === 0) {
        resolved = true
        // Check if prediction was correct based on the over
        // (You'd need to implement logic to check over totals)
      }
    } else if (prediction.prediction_type === 'boundary_rush') {
      if (outcome.isBoundary) {
        resolved = true
        won = true
      } else if (currentBall % 6 === 0) {
        resolved = true
        won = false
      }
    } else if (prediction.prediction_type === 'wicket_window') {
      if (outcome.isWicket) {
        resolved = true
        won = true
      } else if (currentBall >= prediction.prediction_data?.endBall) {
        resolved = true
        won = false
      }
    }

    if (resolved) {
      // Update prediction status
      await supabase
        .from('predictions')
        .update({
          status: won ? 'won' : 'lost',
          resolved_at: new Date().toISOString()
        })
        .eq('id', prediction.id)

      // Update user wallet if won
      if (won) {
        const { data: user } = await supabase
          .from('users')
          .select('wallet_balance')
          .eq('id', prediction.user_id)
          .single()

        if (user) {
          await supabase
            .from('users')
            .update({
              wallet_balance: user.wallet_balance + prediction.potential_win
            })
            .eq('id', prediction.user_id)
        }
      }
    }
  }
}
