'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/app/lib/supabase'

export default function Leaderboard() {
  const [leaders, setLeaders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  const fetchLeaderboard = async () => {
    const { data, error } = await supabase
      .from('user_stats')
      .select(`
        *,
        wallet!inner(user_id)
      `)
      .order('total_credits_won', { ascending: false })
      .limit(10)

    if (data) {
      // Get user emails
      const userIds = data.map(d => d.user_id)
      const { data: users } = await supabase.auth.admin.listUsers()
      
      const enriched = data.map((stat, index) => ({
        ...stat,
        rank: index + 1,
        email: users?.users.find(u => u.id === stat.user_id)?.email || 'Unknown'
      }))
      
      setLeaders(enriched)
    }
    setLoading(false)
  }

  if (loading) {
    return <div className="animate-pulse bg-gray-200 h-96 rounded-xl"></div>
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">🏆</span>
        <h2 className="text-2xl font-bold text-gray-800">Top Predictors</h2>
      </div>

      <div className="space-y-2">
        {leaders.map((leader) => (
          <div
            key={leader.user_id}
            className={`flex items-center justify-between p-4 rounded-xl transition ${
              leader.rank <= 3
                ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300'
                : 'bg-gray-50 border border-gray-200'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`text-2xl font-bold ${
                leader.rank === 1 ? 'text-yellow-500' :
                leader.rank === 2 ? 'text-gray-400' :
                leader.rank === 3 ? 'text-orange-600' :
                'text-gray-400'
              }`}>
                {leader.rank === 1 ? '🥇' : 
                 leader.rank === 2 ? '🥈' :
                 leader.rank === 3 ? '🥉' : `#${leader.rank}`}
              </div>
              <div>
                <p className="font-semibold text-gray-800">
                  {leader.email.split('@')[0]}
                </p>
                <p className="text-xs text-gray-500">
                  {leader.correct_predictions}/{leader.total_predictions} correct
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-lg font-bold text-green-600">
                {leader.total_credits_won} 💰
              </p>
              <p className="text-xs text-gray-500">
                {leader.accuracy_rate?.toFixed(1)}% accuracy
              </p>
            </div>
          </div>
        ))}
      </div>

      {leaders.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p className="text-lg">No predictions yet!</p>
          <p className="text-sm mt-2">Be the first to predict and top the leaderboard 🚀</p>
        </div>
      )}
    </div>
  )
}
