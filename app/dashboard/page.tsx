'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/app/lib/supabase'
import { User } from '@supabase/supabase-js'
import MatchCard from '@/app/components/MatchCard'
import LiveMatchFeed from '@/app/components/LiveMatchFeed'  // ← NEW: Added this import

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

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = '/'
        return
      }
      setUser(user)

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

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-2xl">⏳ Loading...</div>
      </div>
    )
  }

  const winRate = stats && stats.total_predictions > 0
    ? ((stats.correct_predictions / stats.total_predictions) * 100).toFixed(1)
    : '0.0'

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">🏏 PSL Predictor</h1>
            <p className="text-sm text-gray-600">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </header>

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

        {/* 🔥 NEW: LIVE MATCH FEED SECTION */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">🔴 Live Ball-by-Ball</h2>
            <span className="inline-block bg-red-500 text-white text-xs px-3 py-1 rounded-full animate-pulse">
              LIVE
            </span>
          </div>
          <LiveMatchFeed />
        </div>

        {/* Matches Section */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">🏏 Active Matches</h2>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
              {matches.length} Live
            </span>
          </div>

          {matches.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏏</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No Active Matches
              </h3>
              <p className="text-gray-500">
                Check back soon for live PSL action!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {matches.map((match) => (
                <MatchCard 
                  key={match.id} 
                  match={match}
                  onPredictionSuccess={loadDashboard}
                />
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">⚡ Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition">
              <div className="text-3xl mb-2">📊</div>
              <div className="font-semibold">View Leaderboard</div>
            </button>
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition">
              <div className="text-3xl mb-2">💰</div>
              <div className="font-semibold">Load Credits</div>
            </button>
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition">
              <div className="text-3xl mb-2">📜</div>
              <div className="font-semibold">My History</div>
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
