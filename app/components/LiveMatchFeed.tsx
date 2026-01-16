'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/app/lib/supabase'  // ← Fixed: Use your existing client!

interface Match {
  id: string
  team_a: string
  team_b: string
  status: string
  current_score_a: number
  wickets_a: number
  ball_number: number
  total_balls: number
  last_ball_runs: number
  last_ball_event: string
  updated_at: string
}

export default function LiveMatchFeed() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)

  const fetchMatches = async () => {
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .eq('status', 'live')
      .order('updated_at', { ascending: false })

    if (data) {
      setMatches(data)
      setLoading(false)
    }
  }

  const simulateBall = async () => {
    await fetch('/api/simulate')
    await fetchMatches()
  }

  useEffect(() => {
    fetchMatches()

    // Auto-simulate every 3 seconds
    const interval = setInterval(() => {
      simulateBall()
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const getBallIcon = (event: string) => {
    if (event?.includes('FOUR')) return '🎯'
    if (event?.includes('SIX')) return '🚀'
    if (event?.includes('WICKET')) return '🔥'
    if (event?.includes('Dot')) return '⚪'
    return '🏏'
  }

  const getCurrentOver = (ballNumber: number) => {
    return Math.floor(ballNumber / 6)
  }

  const getBallInOver = (ballNumber: number) => {
    return ballNumber % 6
  }

  if (loading) {
    return <div className="text-center py-8">Loading live matches...</div>
  }

  if (matches.length === 0) {
    return (
      <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <p className="text-gray-500 text-lg mb-2">🏏 No Live Matches</p>
        <p className="text-sm text-gray-400">Matches will appear here when they start</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {matches.map((match) => {
        const currentOver = getCurrentOver(match.ball_number)
        const ballInOver = getBallInOver(match.ball_number)
        const progress = (match.ball_number / match.total_balls) * 100

        return (
          <div key={match.id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            {/* Match Header */}
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  {match.team_a} vs {match.team_b}
                </h3>
                <p className="text-sm text-gray-500">
                  Over {currentOver}.{ballInOver} / {match.total_balls / 6}
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-green-600">
                  {match.current_score_a}/{match.wickets_a}
                </div>
                <span className="inline-block bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                  🔴 LIVE
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Last Ball */}
            {match.last_ball_event && (
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">{getBallIcon(match.last_ball_event)}</span>
                    <div>
                      <p className="text-sm text-gray-500">Last Ball</p>
                      <p className="font-bold text-lg text-gray-800">{match.last_ball_event}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      {match.last_ball_runs > 0 ? `+${match.last_ball_runs}` : match.last_ball_runs}
                    </div>
                    <p className="text-xs text-gray-500">runs</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
