'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import AuthForm from './components/AuthForm'

export default function Home() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      window.location.href = '/dashboard'
    } else {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">⏳ Loading...</div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-4">🏏 PSL Predictor</h1>
          <p className="text-xl text-gray-600">
            Real-time cricket predictions. Skill-based. Instant rewards.
          </p>
        </div>
        <AuthForm />
      </div>
    </main>
  )
}
