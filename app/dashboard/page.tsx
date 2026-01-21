'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import MatchCard from '@/app/components/MatchCard'
import LiveMatchFeed from '@/app/components/LiveMatchFeed'
import PredictionModal from '@/app/components/PredictionModal'

interface Wallet {
  credits_balance: number
  total_predictions: number
}

interface UserStats {
  total_predictions: number
  correct_predictions: number
  credits_won: number
  credits_spent: number
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [matches, setMatches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [hasReset, setHasReset] = useState(false)
  const [selectedMatch, setSelectedMatch] = useState<any | null>(null)

  useEffect(() => {
    loadDashboard(true) // Initial load with reset
    
    // Realistic cricket timing: 35 seconds per ball (5 seconds in dev mode)
    const BALL_INTERVAL = process.env.NEXT_PUBLIC_DEV_MODE === 'true' 
      ? 5000   // 5 seconds for testing
      : 35000  // 35 seconds for production
    
    const simulationInterval = setInterval(async () => {
      try {
        await fetch('/api/simulate')
        // Reload dashboard data to show updates
        await loadDashboard(false) // Don't reset on refresh
      } catch (error) {
        console.error('Simulation error:', error)
      }
    }, BALL_INTERVAL)

    // Cleanup on unmount
    return () => clearInterval(simulationInterval)
  }, [])

  const loadDashboard = async (shouldReset: boolean = false) => {
    try {
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        // Clear invalid session and redirect
        await supabase.auth.signOut()
        window.location.href = '/'
        return
      }
      setUser(user)

      // MVP: Reset all matches for fresh simulation experience ONLY on initial login
      if (shouldReset && !hasReset) {
        await supabase
          .from('matches')
          .update({
            status: 'live',
            ball_number: 0,
            current_score_a: 0,
            current_wickets_a: 0,
            current_over: 0,
            last_ball_runs: 0,
            last_ball_event: null
          })
          .neq('id', '00000000-0000-0000-0000-000000000000') // Update all matches
        
        setHasReset(true)
      }

      // Get wallet
      const { data: walletData } = await supabase
        .from('wallet')
        .select('*')
        .eq('user_id', user.id)
        .single()
      
      setWallet(walletData)

      // Get user stats
      const { data: statsData } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .single()
      
      setStats(statsData)

      // Get active/upcoming matches
      const { data: matchesData } = await supabase
        .from('matches')
        .select('*')
        .in('status', ['upcoming', 'live'])
        .order('match_date', { ascending: true })
      
      setMatches(matchesData || [])

    } catch (error) {
      console.error('Dashboard load error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-2xl text-white">⏳ Loading...</div>
      </div>
    )
  }

  const winRate = stats && stats.total_predictions > 0
    ? ((stats.correct_predictions / stats.total_predictions) * 100).toFixed(1)
    : '0.0'

  return (
    <div className="min-h-screen bg-gray-900">
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Wallet & Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Wallet */}
          <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold">💰 Credits</h2>
              <span className="text-3xl">🪙</span>
            </div>
            <div className="text-4xl font-bold mb-1">
              {wallet?.credits_balance || 0}
            </div>
            <div className="text-sm opacity-90">
              {wallet?.total_predictions || 0} predictions made
            </div>
          </div>

          {/* Win Rate */}
          <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold">🎯 Win Rate</h2>
              <span className="text-3xl">📊</span>
            </div>
            <div className="text-4xl font-bold mb-1">
              {winRate}%
            </div>
            <div className="text-sm opacity-90">
              {stats?.correct_predictions || 0}/{stats?.total_predictions || 0} correct
            </div>
          </div>

          {/* Net Credits */}
          <div className="bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold">📈 Net Earnings</h2>
              <span className="text-3xl">💎</span>
            </div>
            <div className="text-4xl font-bold mb-1">
              {((stats?.credits_won || 0) - (stats?.credits_spent || 0)).toFixed(0)}
            </div>
            <div className="text-sm opacity-90">
              Won: {stats?.credits_won || 0} | Spent: {stats?.credits_spent || 0}
            </div>
          </div>
        </div>

        {/* 🔥 LIVE MATCH FEED SECTION */}
        <div className="bg-gray-800 rounded-xl shadow-lg p-6 mb-8 border border-gray-700">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">🔴 Live Ball-by-Ball</h2>
            <span className="inline-block bg-red-500 text-white text-xs px-3 py-1 rounded-full animate-pulse">
              LIVE
            </span>
          </div>
          <LiveMatchFeed />
        </div>

        {/* Matches Section */}
        <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">🏏 Active Matches</h2>
            <span className="px-3 py-1 bg-green-500 text-white rounded-full text-sm font-semibold">
              {matches.length} Live
            </span>
          </div>

          {matches.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏏</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                No Active Matches
              </h3>
              <p className="text-gray-400">
                Check back soon for live PSL action!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {matches.map((match) => (
                <MatchCard 
                  key={match.id} 
                  match={match}
                  onPredict={setSelectedMatch}
                  onPredictionSuccess={() => loadDashboard(false)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4">⚡ Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={() => window.location.href = '/leaderboard'}
              className="p-4 border-2 border-dashed border-gray-600 rounded-lg hover:border-blue-500 hover:bg-gray-700 transition text-white"
            >
              <div className="text-3xl mb-2">📊</div>
              <div className="font-semibold">View Leaderboard</div>
            </button>
            <button 
              onClick={() => window.location.href = '/credits'}
              className="p-4 border-2 border-dashed border-gray-600 rounded-lg hover:border-green-500 hover:bg-gray-700 transition text-white"
            >
              <div className="text-3xl mb-2">💰</div>
              <div className="font-semibold">Load Credits</div>
            </button>
            <button 
              onClick={() => window.location.href = '/predictions'}
              className="p-4 border-2 border-dashed border-gray-600 rounded-lg hover:border-purple-500 hover:bg-gray-700 transition text-white"
            >
              <div className="text-3xl mb-2">📜</div>
              <div className="font-semibold">My History</div>
            </button>
          </div>
        </div>
      </main>

      {/* Prediction Modal */}
      {selectedMatch && (
        <PredictionModal
          match={selectedMatch}
          onClose={() => setSelectedMatch(null)}
          onSuccess={() => {
            setSelectedMatch(null)
            loadDashboard(false)
          }}
        />
      )}
    </div>
  )
}
