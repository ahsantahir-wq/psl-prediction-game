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
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) {
        // Clear invalid session
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
      <div className="min-h-screen flex items-center justify-center">
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
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-4">🏏 PSL Predictor</h1>
          <p className="text-xl text-gray-600">
            Real-time cricket predictions. Skill-based. Instant rewards.
          </p>
          
          {/* PSL Team Logos */}
          <div className="mt-8 mb-6">
            <p className="text-sm text-gray-500 mb-4">Predict for your favorite PSL teams</p>
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
        </div>
        <AuthForm />
      </div>
    </main>
  )
}
