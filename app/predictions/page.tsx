'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Prediction {
  id: string
  created_at: string
  status: string
  action_type: string
  predicted_outcome: string
  amount: number
  potential_payout: number
  resolved_at: string | null
  matches: {
    team_a: string
    team_b: string
    last_ball_event: string | null
  }
}

export default function PredictionsPage() {
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    async function loadPredictions() {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }
      setUserId(user.id)

      // Load predictions
      const { data } = await supabase
        .from('predictions')
        .select('*, matches(team_a, team_b, last_ball_event)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      setPredictions(data as Prediction[] || [])
      setLoading(false)
    }

    loadPredictions()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading predictions...</div>
      </div>
    )
  }

  if (!userId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Please login to view predictions</div>
      </div>
    )
  }

  const stats = {
    total: predictions.length,
    won: predictions.filter(p => p.status === 'won').length,
    lost: predictions.filter(p => p.status === 'lost').length,
    pending: predictions.filter(p => p.status === 'pending').length,
    totalBet: predictions.reduce((sum, p) => sum + p.amount, 0),
    totalWon: predictions.filter(p => p.status === 'won').reduce((sum, p) => sum + p.potential_payout, 0)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">My Predictions 🎯</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-gray-500 text-sm">Total</div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg shadow">
            <div className="text-green-600 text-sm">Won ✅</div>
            <div className="text-2xl font-bold text-green-600">{stats.won}</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg shadow">
            <div className="text-red-600 text-sm">Lost ❌</div>
            <div className="text-2xl font-bold text-red-600">{stats.lost}</div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg shadow">
            <div className="text-blue-600 text-sm">Pending ⏳</div>
            <div className="text-2xl font-bold text-blue-600">{stats.pending}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow mb-8">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-gray-500 text-sm">Total Bet</div>
              <div className="text-xl font-bold">{stats.totalBet} credits</div>
            </div>
            <div>
              <div className="text-gray-500 text-sm">Total Won</div>
              <div className="text-xl font-bold text-green-600">{stats.totalWon} credits</div>
            </div>
          </div>
        </div>

        {/* Predictions Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Match</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prediction</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bet</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Result</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {predictions.map((pred) => (
                  <tr key={pred.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        pred.status === 'won' ? 'bg-green-100 text-green-800' :
                        pred.status === 'lost' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {pred.status === 'won' ? '✅ WON' :
                         pred.status === 'lost' ? '❌ LOST' :
                         '⏳ PENDING'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {pred.matches.team_a} vs {pred.matches.team_b}
                    </td>
                    <td className="px-4 py-3 text-sm capitalize">
                      {pred.action_type.replace('_', ' ')}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">
                      {pred.predicted_outcome}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {pred.amount}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {pred.status === 'won' ? (
                        <span className="text-green-600 font-bold">+{pred.potential_payout}</span>
                      ) : pred.status === 'lost' ? (
                        <span className="text-red-600">-{pred.amount}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(pred.created_at).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {predictions.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <div className="text-6xl mb-4">🎯</div>
            <div className="text-xl">No predictions yet!</div>
            <div className="mt-2">Go to the dashboard and make some predictions.</div>
          </div>
        )}
      </div>
    </div>
  )
}
