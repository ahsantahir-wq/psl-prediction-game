'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AuthForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        })

        if (error) throw error

        if (data.user) {  // Create wallet for new user  const { data: walletData, error: walletError } = await supabase    .from('wallet')    .insert({      user_id: data.user.id,      credits_balance: 100,      total_predictions: 0    })    .select()  console.log('Wallet creation response:', { walletData, walletError })  if (walletError) {    console.error('FULL WALLET ERROR:', JSON.stringify(walletError, null, 2))    setMessage('⚠️ Account created but wallet setup failed. Please refresh.')  } else {    setMessage('✅ Account created! You got 100 free credits!')  }}

          setMessage('✅ Account created! You got 100 free credits!')
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error
        setMessage('✅ Logged in successfully!')
      }
    } catch (error: any) {
      setMessage('❌ ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🏏</div>
          <h1 className="text-3xl font-bold text-gray-800">PSL Predictions</h1>
          <p className="text-gray-600 mt-2">
            {isSignUp ? 'Create account & get 100 free credits!' : 'Welcome back!'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              minLength={6}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition"
            />
            {isSignUp && (
              <p className="text-xs text-gray-500 mt-1">
                Minimum 6 characters
              </p>
            )}
          </div>

          {message && (
            <div className={`p-3 rounded-lg text-sm ${
              message.includes('✅') 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-bold text-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? '⏳ Processing...' : isSignUp ? '🚀 Sign Up' : '🔓 Login'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp)
              setMessage('')
            }}
            className="text-sm text-blue-600 hover:underline"
          >
            {isSignUp 
              ? '← Already have an account? Login' 
              : "Don't have an account? Sign up →"}
          </button>
        </div>

        {isSignUp && (
          <div className="mt-6 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
            <p className="text-sm text-green-800 font-semibold">
              🎁 New User Bonus:
            </p>
            <p className="text-xs text-green-700 mt-1">
              Get 100 free credits to start predicting!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
