'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import MatchCard from '@/app/components/MatchCard'
import LiveMatchFeed from '@/app/components/LiveMatchFeed'
import PredictionModal from '@/app/components/PredictionModal'

const MATCHES_PER_PAGE = 5;

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
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [offset, setOffset] = useState(0)
  const [hasReset, setHasReset] = useState(false)
  const [selectedMatch, setSelectedMatch] = useState<any | null>(null)

  useEffect(() => {
    loadDashboard(true) // Initial load with reset
    
    // Auto-start simulation with 8 second intervals
    const simulationInterval = setInterval(async () => {
      try {
        await fetch('/api/simulate')
        // Reload dashboard data to show updates
        await loadDashboard(false) // Don't reset on refresh
      } catch (error) {
        console.error('Simulation error:', error)
      }
    }, 8000) // 8 seconds between each ball

    // Cleanup on unmount
    return () => clearInterval(simulationInterval)
  }, [])

  const loadDashboard = async (shouldReset: boolean = false, loadMore = false) => {
    try {
      if (loadMore) setLoadingMore(true);
      
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

      // Load favorited matches with pagination
      const { data: favoritesData } = await supabase
        .from('user_favorites')
        .select('match_id')
        .eq('user_id', user.id);

      if (favoritesData && favoritesData.length > 0) {
        const favoriteMatchIds = favoritesData.map(f => f.match_id);
        
        const currentOffset = loadMore ? offset : 0;
        
        const { data: matchesData } = await supabase
          .from('matches')
          .select('*')
          .in('id', favoriteMatchIds)
          .eq('status', 'live')
          .order('match_date', { ascending: true })
          .range(currentOffset, currentOffset + MATCHES_PER_PAGE - 1);

        if (matchesData) {
          if (loadMore) {
            setMatches(prev => [...prev, ...matchesData]);
            setOffset(prev => prev + MATCHES_PER_PAGE);
          } else {
            setMatches(matchesData);
            setOffset(MATCHES_PER_PAGE);
          }
          
          setHasMore(matchesData.length === MATCHES_PER_PAGE);
        }
      } else {
        setMatches([]);
        setHasMore(false);
      }

    } catch (error) {
      console.error('Dashboard load error:', error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
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

        {/* Favorited Matches */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">⭐ Your Favorite Matches</h2>
            <a 
              href="/matches"
              className="text-blue-600 hover:underline text-sm font-semibold"
            >
              View All Live Matches →
            </a>
          </div>

          {matches.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">⭐</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                You haven't favorited any matches yet.
              </h3>
              <p className="text-gray-500 mb-6">
                Browse live matches and star your favorites to see them here!
              </p>
              <a
                href="/matches"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold"
              >
                Browse Live Matches
              </a>
            </div>
          ) : (
            <>
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
              
              {/* Load More Button */}
              {hasMore && (
                <div className="mt-8 text-center">
                  <button
                    onClick={() => loadDashboard(false, true)}
                    disabled={loadingMore}
                    className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {loadingMore ? 'Loading...' : 'Load More Matches'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">⚡ Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={() => window.location.href = '/leaderboard'}
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
            >
              <div className="text-3xl mb-2">📊</div>
              <div className="font-semibold">View Leaderboard</div>
            </button>
            <button 
              onClick={() => window.location.href = '/credits'}
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition"
            >
              <div className="text-3xl mb-2">💰</div>
              <div className="font-semibold">Load Credits</div>
            </button>
            <button 
              onClick={() => window.location.href = '/predictions'}
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition"
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
