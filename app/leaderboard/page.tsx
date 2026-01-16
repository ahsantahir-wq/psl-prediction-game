'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface LeaderboardEntry {
  user_id: string
  email: string
  total_predictions: number
  correct_predictions: number
  accuracy_rate: number
  credits_balance: number
  rank: number
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLeaderboard()
  }, [])

  const loadLeaderboard = async () => {
    try {
      // Get all users with their stats
      const { data: users } = await supabase.auth.admin.listUsers()
      const { data: stats } = await supabase
        .from('user_stats')
        .select('*')
        .order('correct_predictions', { ascending: false })
        .limit(50)

      const { data: wallets } = await supabase
        .from('wallet')
        .select('*')

      if (stats && wallets) {
        const leaderboardData = stats.map((stat, index) => {
          const wallet = wallets.find(w => w.user_id === stat.user_id)
          const user = users?.users.find(u => u.id === stat.user_id)
          
          return {
            user_id: stat.user_id,
            email: user?.email || 'Anonymous',
            total_predictions: stat.total_predictions || 0,
            correct_predictions: stat.correct_predictions || 0,
            accuracy_rate: stat.total_predictions > 0 
              ? (stat.correct_predictions / stat.total_predictions) * 100 
              : 0,
            credits_balance: wallet?.credits_balance || 0,
            rank: index + 1
          }
        })

        setLeaderboard(leaderboardData)
      }
    } catch (error) {
      console.error('Leaderboard load error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-2xl">⏳ Loading Leaderboard...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">🏆 Leaderboard</h1>
            <p className="text-sm text-gray-600">Top PSL Prediction Masters</p>
          </div>
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            ← Back to Dashboard
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Top 3 Podium */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {leaderboard.slice(0, 3).map((entry, index) => (
            <div
              key={entry.user_id}
              className={`rounded-xl shadow-lg p-6 text-white ${
                index === 0
                  ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 md:order-2 transform md:scale-110'
                  : index === 1
                  ? 'bg-gradient-to-br from-gray-300 to-gray-500 md:order-1'
                  : 'bg-gradient-to-br from-orange-400 to-orange-600 md:order-3'
              }`}
            >
              <div className="text-center">
                <div className="text-6xl mb-3">
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                </div>
                <div className="text-2xl font-bold mb-2">#{entry.rank}</div>
                <div className="font-semibold mb-3 truncate">{entry.email}</div>
                <div className="bg-white bg-opacity-20 rounded-lg p-3 mb-2">
                  <div className="text-sm opacity-90">Accuracy</div>
                  <div className="text-2xl font-bold">{entry.accuracy_rate.toFixed(1)}%</div>
                </div>
                <div className="text-sm">
                  {entry.correct_predictions}/{entry.total_predictions} Correct
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Full Leaderboard Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <h2 className="text-2xl font-bold">Full Rankings</h2>
            <p className="text-sm opacity-90">All PSL Prediction Champions</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Rank</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Player</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">Predictions</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">Correct</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">Accuracy</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">Credits</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {leaderboard.map((entry) => (
                  <tr
                    key={entry.user_id}
                    className="hover:bg-gray-50 transition"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg text-gray-800">
                          #{entry.rank}
                        </span>
                        {entry.rank <= 3 && (
                          <span className="text-2xl">
                            {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-800 truncate max-w-xs">
                        {entry.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-gray-700">{entry.total_predictions}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-green-600 font-semibold">
                        {entry.correct_predictions}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full"
                            style={{ width: `${entry.accuracy_rate}%` }}
                          />
                        </div>
                        <span className="font-bold text-gray-800">
                          {entry.accuracy_rate.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-semibold text-sm">
                        {entry.credits_balance} 🪙
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {leaderboard.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏆</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No Rankings Yet
              </h3>
              <p className="text-gray-500">
                Be the first to make predictions and climb the leaderboard!
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
