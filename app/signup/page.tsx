'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Step 1: Sign up the user
      const { error: signupError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (signupError) throw signupError

      // Step 2: Auto-login
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (loginError) throw loginError

      // Step 3: Create wallet with 100 credits
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { error: walletError } = await supabase
          .from('wallet')
          .insert({
            user_id: user.id,
            balance: 100,
          })

        if (walletError) {
          console.error('Wallet creation error:', walletError)
          // Don't throw - user is created, just log the error
        }
      }

      // ✅ THIS IS THE FIX - Use window.location.href
      window.location.href = '/dashboard'
      
    } catch (error: any) {
      setError(error.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-white mb-6">Sign Up for PSL Predictor</h1>
        
        {error && (
          <div className="bg-red-500 text-white p-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-gray-300 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-green-500 focus:outline-none"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-green-500 focus:outline-none"
              required
              minLength={6}
              disabled={loading}
            />
            <p className="text-gray-400 text-sm mt-1">Minimum 6 characters</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            {loading ? 'Creating Account...' : 'Sign Up & Get 100 Credits'}
          </button>
        </form>

        <p className="text-gray-400 mt-6 text-center">
          Already have an account?{' '}
          <a href="/login" className="text-green-500 hover:underline font-semibold">
            Login
          </a>
        </p>
      </div>
    </div>
  )
}
