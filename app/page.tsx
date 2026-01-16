'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) {
        await supabase.auth.signOut()
        setLoading(false)
        return
      }
      
      if (user) {
        window.location.href = '/dashboard'
      } else {
        setLoading(false)
      }
    } catch (error) {
      console.error('Auth check error:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-2xl">⏳ Loading...</div>
      </div>
    )
  }

  const teams = [
    { name: 'Karachi Kings', logo: 'https://wmuibafrpidgwaidekrj.supabase.co/storage/v1/object/public/team-logos/Karachi_Kings.png' },
    { name: 'Lahore Qalandars', logo: 'https://wmuibafrpidgwaidekrj.supabase.co/storage/v1/object/public/team-logos/Lahore_Qalandars.png' },
    { name: 'Islamabad United', logo: 'https://wmuibafrpidgwaidekrj.supabase.co/storage/v1/object/public/team-logos/Islamabad_United.png' },
    { name: 'Multan Sultans', logo: 'https://wmuibafrpidgwaidekrj.supabase.co/storage/v1/object/public/team-logos/MultanSultans.png' },
    { name: 'Peshawar Zalmi', logo: 'https://wmuibafrpidgwaidekrj.supabase.co/storage/v1/object/public/team-logos/Peshawar_Zalmi_logo.png' },
    { name: 'Quetta Gladiators', logo: 'https://wmuibafrpidgwaidekrj.supabase.co/storage/v1/object/public/team-logos/Quetta_Gladiators.png' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto text-center">
          {/* Main Headline */}
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            PSL Fantasy Cricket<br />
            <span className="text-blue-600">Prediction Challenge</span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl text-gray-700 mb-10 max-w-3xl mx-auto leading-relaxed">
            Join the ultimate PSL prediction league. Test your cricket knowledge, 
            compete with fans, and climb the leaderboard this season!
          </p>

          {/* PSL Team Logos */}
          <div className="mb-10">
            <p className="text-sm text-gray-600 mb-4">Predict for your favorite PSL teams</p>
            <div className="flex justify-center items-center gap-4 flex-wrap">
              {teams.map((team) => (
                <div
                  key={team.name}
                  className="w-16 h-16 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-shadow"
                  title={team.name}
                >
                  <img
                    src={team.logo}
                    alt={team.name}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23374151" width="100" height="100"/%3E%3Ctext x="50" y="50" font-size="40" text-anchor="middle" dy=".3em" fill="%239CA3AF"%3E🏏%3C/text%3E%3C/svg%3E'
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Key Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-5xl mx-auto">
            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition">
              <div className="text-5xl mb-4">📊</div>
              <h3 className="text-gray-900 font-bold text-xl mb-3">Live Match Analysis</h3>
              <p className="text-gray-600 text-sm">
                Make predictions during live PSL matches based on team form, pitch conditions, and player performance
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition">
              <div className="text-5xl mb-4">🎯</div>
              <h3 className="text-gray-900 font-bold text-xl mb-3">Cricket Trivia</h3>
              <p className="text-gray-600 text-sm">
                Answer PSL trivia questions, predict match outcomes, and earn points for accurate forecasts
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition">
              <div className="text-5xl mb-4">🏆</div>
              <h3 className="text-gray-900 font-bold text-xl mb-3">Compete & Win</h3>
              <p className="text-gray-600 text-sm">
                Track your accuracy, build winning streaks, and compete for the top spot on the leaderboard
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="mt-12 flex flex-col md:flex-row gap-4 justify-center">
            <a href="/signup">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-10 rounded-lg text-lg shadow-lg transition transform hover:scale-105">
                Join Free
              </button>
            </a>
            <a href="/login">
              <button className="bg-white hover:bg-gray-50 text-blue-600 font-bold py-4 px-10 rounded-lg text-lg border-2 border-blue-600 transition">
                Sign In
              </button>
            </a>
          </div>

          {/* Trust Indicators */}
          <div className="mt-10 flex flex-wrap justify-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏏</span>
              <span>Official PSL Predictions</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">✨</span>
              <span>Free to Join</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">📈</span>
              <span>Real-time Updates</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-white py-16 px-6">
        <div className="container mx-auto">
          <h2 className="text-gray-900 text-4xl font-bold text-center mb-4">
            How It Works
          </h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Join thousands of cricket fans making predictions on live PSL matches
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="bg-blue-600 w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4 shadow-lg">
                1
              </div>
              <h3 className="text-gray-900 font-bold text-lg mb-3">Create Account</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Sign up free and get starting points to begin your prediction journey
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-600 w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4 shadow-lg">
                2
              </div>
              <h3 className="text-gray-900 font-bold text-lg mb-3">Watch & Predict</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Follow live PSL matches and make predictions on overs, boundaries, and wickets
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-600 w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4 shadow-lg">
                3
              </div>
              <h3 className="text-gray-900 font-bold text-lg mb-3">Earn Points</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Get points for correct predictions and build your winning streak
              </p>
            </div>

            <div className="text-center">
              <div className="bg-yellow-600 w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4 shadow-lg">
                4
              </div>
              <h3 className="text-gray-900 font-bold text-lg mb-3">Climb Leaderboard</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Compete with other fans and reach the top of the rankings
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16 px-6">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-gray-900 text-4xl font-bold text-center mb-12">
            Why Join Our League?
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <h3 className="text-blue-600 font-bold text-xl mb-4 flex items-center gap-3">
                <span className="text-3xl">🎓</span> Cricket Knowledge
              </h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">✓</span>
                  <span>Understand match dynamics and player strategies</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">✓</span>
                  <span>Learn from PSL statistics and team performance data</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">✓</span>
                  <span>Improve your cricket IQ with every prediction</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg">
              <h3 className="text-green-600 font-bold text-xl mb-4 flex items-center gap-3">
                <span className="text-3xl">📈</span> Track Progress
              </h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Monitor your prediction accuracy over the season</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Build winning streaks and earn bonus points</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>See detailed stats on your performance</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg">
              <h3 className="text-purple-600 font-bold text-xl mb-4 flex items-center gap-3">
                <span className="text-3xl">🏅</span> Fair Competition
              </h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-1">✓</span>
                  <span>Everyone starts with equal points</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-1">✓</span>
                  <span>Rankings based on prediction accuracy</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-1">✓</span>
                  <span>Transparent scoring system</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg">
              <h3 className="text-orange-600 font-bold text-xl mb-4 flex items-center gap-3">
                <span className="text-3xl">🎯</span> Interactive Experience
              </h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 mt-1">✓</span>
                  <span>Make predictions during live matches</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 mt-1">✓</span>
                  <span>Instant results after each over</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 mt-1">✓</span>
                  <span>Compete with friends and cricket fans</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-12 px-6 border-t border-gray-200">
        <div className="container mx-auto text-center">
          <p className="text-gray-600 mb-6 text-lg font-semibold">
            🏏 PSL Fantasy Prediction League
          </p>
          
          <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-600 mb-8">
            <a href="/signup" className="hover:text-blue-600 transition">Join Now</a>
            <a href="/login" className="hover:text-blue-600 transition">Sign In</a>
            <a href="/dashboard" className="hover:text-blue-600 transition">Play</a>
          </div>

          <p className="text-gray-500 text-sm max-w-2xl mx-auto mb-4">
            Join the cricket prediction league where fans test their PSL knowledge through trivia and match forecasts. 
            No real money involved - just pure cricket fun!
          </p>

          <p className="text-gray-400 text-xs mt-8">
            © 2026 PSL Prediction League. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
