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
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-2xl text-white">⏳ Loading...</div>
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
    <div className="min-h-screen bg-gray-950">
      {/* Hero Section - Skill-Based Focus */}
      <section className="bg-gradient-to-br from-green-900 via-gray-900 to-blue-900 py-20 px-6">
        <div className="container mx-auto text-center">
          {/* Skill Badge */}
          <div className="inline-block mb-6">
            <span className="bg-blue-500 text-white px-6 py-3 rounded-full text-sm font-bold shadow-lg">
              🧠 100% Skill-Based Cricket Game
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Master the Art of<br />
            Cricket Prediction
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
            Test your cricket knowledge with live PSL predictions. 
            Analyze match situations, make strategic forecasts, and compete 
            with cricket experts on the leaderboard!
          </p>

          {/* PSL Team Logos */}
          <div className="mb-10">
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

          {/* Key Value Props */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-5xl mx-auto">
            <div className="bg-gray-800 bg-opacity-80 p-6 rounded-xl border border-green-500 hover:border-green-400 transition">
              <div className="text-5xl mb-4">📊</div>
              <h3 className="text-white font-bold text-xl mb-3">Strategic Analysis</h3>
              <p className="text-gray-400 text-sm">
                Study pitch conditions, team stats, player form, and live match momentum
              </p>
            </div>

            <div className="bg-gray-800 bg-opacity-80 p-6 rounded-xl border border-blue-500 hover:border-blue-400 transition">
              <div className="text-5xl mb-4">🎯</div>
              <h3 className="text-white font-bold text-xl mb-3">Knowledge Testing</h3>
              <p className="text-gray-400 text-sm">
                Challenge your cricket IQ with micro-moment predictions and daily quizzes
              </p>
            </div>

            <div className="bg-gray-800 bg-opacity-80 p-6 rounded-xl border border-purple-500 hover:border-purple-400 transition">
              <div className="text-5xl mb-4">🏆</div>
              <h3 className="text-white font-bold text-xl mb-3">Skill Rankings</h3>
              <p className="text-gray-400 text-sm">
                Climb the leaderboard based on accuracy, streaks, and cricket expertise
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="mt-12 flex flex-col md:flex-row gap-4 justify-center">
            <a href="/dashboard">
              <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-10 rounded-lg text-lg shadow-lg transition transform hover:scale-105">
                Start Playing Free
              </button>
            </a>
            <a href="/signup">
              <button className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-4 px-10 rounded-lg text-lg border border-gray-600 transition">
                Create Account
              </button>
            </a>
          </div>

          {/* Trust Badges */}
          <div className="mt-10 flex flex-wrap justify-center gap-6 text-sm">
            <div className="flex items-center gap-2 text-green-400">
              <span className="text-2xl">✓</span>
              <span>100% Skill-Based</span>
            </div>
            <div className="flex items-center gap-2 text-blue-400">
              <span className="text-2xl">✓</span>
              <span>No Gambling</span>
            </div>
            <div className="flex items-center gap-2 text-purple-400">
              <span className="text-2xl">✓</span>
              <span>Free to Play</span>
            </div>
            <div className="flex items-center gap-2 text-yellow-400">
              <span className="text-2xl">✓</span>
              <span>Knowledge-Based</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-gray-900 py-16 px-6">
        <div className="container mx-auto">
          <h2 className="text-white text-4xl font-bold text-center mb-4">
            How the Skill Game Works
          </h2>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            Your success depends entirely on cricket knowledge, strategic thinking, and prediction accuracy
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {/* Step 1 */}
            <div className="text-center">
              <div className="bg-gradient-to-br from-green-600 to-green-700 w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4 shadow-lg">
                1
              </div>
              <h3 className="text-white font-bold text-lg mb-3">Study the Match</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Analyze team statistics, pitch reports, weather conditions, and live match flow
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4 shadow-lg">
                2
              </div>
              <h3 className="text-white font-bold text-lg mb-3">Make Predictions</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Use your cricket IQ to forecast over outcomes, boundaries, and wickets
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="bg-gradient-to-br from-purple-600 to-purple-700 w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4 shadow-lg">
                3
              </div>
              <h3 className="text-white font-bold text-lg mb-3">Earn Skill Points</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Correct predictions earn SP, increase accuracy rating, and unlock achievements
              </p>
            </div>

            {/* Step 4 */}
            <div className="text-center">
              <div className="bg-gradient-to-br from-yellow-600 to-yellow-700 w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4 shadow-lg">
                4
              </div>
              <h3 className="text-white font-bold text-lg mb-3">Climb Rankings</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Compete for top positions on the Cricket Masters leaderboard
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-950 py-16 px-6">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-white text-4xl font-bold text-center mb-12">
            What Makes This a Skill Game?
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gray-800 p-8 rounded-xl border border-gray-700">
              <h3 className="text-green-400 font-bold text-xl mb-4 flex items-center gap-3">
                <span className="text-3xl">🎓</span> Knowledge-Based
              </h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>Requires understanding of cricket rules and strategies</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>Analysis of team performance and player statistics</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>Study of pitch conditions and match situations</span>
                </li>
              </ul>
            </div>

            <div className="bg-gray-800 p-8 rounded-xl border border-gray-700">
              <h3 className="text-blue-400 font-bold text-xl mb-4 flex items-center gap-3">
                <span className="text-3xl">📈</span> Skill Improvement
              </h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">✓</span>
                  <span>Track your prediction accuracy over time</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">✓</span>
                  <span>Learn from correct and incorrect predictions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">✓</span>
                  <span>Level up as you gain more cricket expertise</span>
                </li>
              </ul>
            </div>

            <div className="bg-gray-800 p-8 rounded-xl border border-gray-700">
              <h3 className="text-purple-400 font-bold text-xl mb-4 flex items-center gap-3">
                <span className="text-3xl">🧠</span> Strategic Thinking
              </h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">✓</span>
                  <span>Decide when to make predictions based on confidence</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">✓</span>
                  <span>Manage your skill points strategically</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">✓</span>
                  <span>Choose prediction types based on match flow</span>
                </li>
              </ul>
            </div>

            <div className="bg-gray-800 p-8 rounded-xl border border-gray-700">
              <h3 className="text-yellow-400 font-bold text-xl mb-4 flex items-center gap-3">
                <span className="text-3xl">🏅</span> Fair Competition
              </h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 mt-1">✓</span>
                  <span>Everyone starts with equal skill points</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 mt-1">✓</span>
                  <span>Rankings based purely on accuracy and knowledge</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 mt-1">✓</span>
                  <span>No pay-to-win mechanics</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Legal Disclaimer */}
      <section className="bg-gray-900 py-12 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-gradient-to-r from-blue-900 to-purple-900 p-8 rounded-xl border-l-4 border-blue-500">
            <h3 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
              <span className="text-2xl">⚖️</span>
              This is a Skill-Based Game, Not Gambling
            </h3>
            <p className="text-gray-300 leading-relaxed mb-4">
              Our platform is designed as an <strong>educational and competitive cricket knowledge game</strong>. 
              Your success depends entirely on:
            </p>
            <ul className="text-gray-300 space-y-2 ml-6">
              <li>• Understanding cricket rules, strategies, and statistics</li>
              <li>• Analyzing live match situations and team performance</li>
              <li>• Strategic decision-making based on available data</li>
              <li>• Continuous learning and skill improvement</li>
            </ul>
            <p className="text-gray-400 text-sm mt-4">
              <strong>No real money involved.</strong> Skill Points (SP) are virtual game currency used solely 
              for gameplay and cannot be exchanged for cash. This platform does not constitute gambling 
              under applicable laws.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 py-12 px-6 border-t border-gray-800">
        <div className="container mx-auto text-center">
          <p className="text-gray-400 mb-6 text-lg">
            🏏 PSL Cricket Prediction Challenge - Test Your Cricket Knowledge
          </p>
          
          <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-500 mb-8">
            <a href="/dashboard" className="hover:text-white transition">Play Now</a>
            <a href="/login" className="hover:text-white transition">Login</a>
            <a href="/signup" className="hover:text-white transition">Sign Up</a>
          </div>

          <div className="bg-gray-900 inline-block px-8 py-4 rounded-lg border border-gray-800">
            <p className="text-green-400 font-bold mb-2">
              ✅ Certified Skill-Based Game
            </p>
            <p className="text-gray-400 text-sm">
              No gambling • No real money • Knowledge-based gameplay • Educational platform
            </p>
          </div>

          <p className="text-gray-600 text-xs mt-8">
            © 2026 PSL Prediction Challenge. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
