import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { matchId: string } }
) {
  const matchId = params.matchId

  try {
    // Fetch the specific match
    const { data: match, error: fetchError } = await supabase
      .from('matches')
      .select('*')
      .eq('id', matchId)
      .single()

    if (fetchError || !match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 })
    }

    // Only progress if match is live
    if (match.status !== 'live') {
      return NextResponse.json({
        message: 'Match is not live',
        status: match.status
      }, { status: 400 })
    }

    // Progress the match
    let ballNumber = (match.ball_number || 0) + 1
    let currentOver = Math.floor(ballNumber / 6)
    
    // Simulate ball outcome
    const outcomes = [
      { event: 'dot', runs: 0, isWicket: false },
      { event: 'single', runs: 1, isWicket: false },
      { event: 'double', runs: 2, isWicket: false },
      { event: 'four', runs: 4, isWicket: false },
      { event: 'six', runs: 6, isWicket: false },
      { event: 'wicket', runs: 0, isWicket: true }
    ]
    const outcome = outcomes[Math.floor(Math.random() * outcomes.length)]

    // Determine which team is batting
    const battingTeam = match.batting_team || match.team_a
    const isBattingTeamA = battingTeam === match.team_a

    // Update scores
    const newScoreA = isBattingTeamA 
      ? (match.current_score_a || 0) + outcome.runs 
      : match.current_score_a || 0
    
    const newScoreB = !isBattingTeamA 
      ? (match.current_score_b || 0) + outcome.runs 
      : match.current_score_b || 0

    const newWicketsA = isBattingTeamA && outcome.isWicket
      ? (match.current_wickets_a || 0) + 1
      : match.current_wickets_a || 0

    const newWicketsB = !isBattingTeamA && outcome.isWicket
      ? (match.current_wickets_b || 0) + 1
      : match.current_wickets_b || 0

    // Update match
    const { error: updateError } = await supabase
      .from('matches')
      .update({
        ball_number: ballNumber,
        current_over: currentOver,
        current_score_a: newScoreA,
        current_score_b: newScoreB,
        current_wickets_a: newWicketsA,
        current_wickets_b: newWicketsB,
        last_ball_runs: outcome.runs,
        last_ball_event: outcome.event,
        updated_at: new Date().toISOString()
      })
      .eq('id', matchId)

    if (updateError) throw updateError

    return NextResponse.json({
      success: true,
      ballNumber,
      currentOver,
      outcome: outcome.event,
      runs: outcome.runs,
      scoreA: newScoreA,
      scoreB: newScoreB
    })
  } catch (error) {
    console.error('Simulator error:', error)
    return NextResponse.json({ error: 'Simulation failed' }, { status: 500 })
  }
}
