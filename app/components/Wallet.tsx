'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Wallet({ userId }: { userId: string }) {
  const [wallet, setWallet] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWallet()
    
    // Subscribe to changes
    const channel = supabase
      .channel('wallet-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'wallet',
          filter: `user_id=eq.${userId}`,
        },
        () => fetchWallet()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  const fetchWallet = async () => {
    const { data, error } = await supabase
      .from('wallet')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (data) setWallet(data)
    setLoading(false)
  }

  if (loading) return <div className="animate-pulse bg-gray-200 h-24 rounded-xl"></div>

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white shadow-lg">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm opacity-90">Available Credits</p>
          <p className="text-4xl font-bold mt-1">{wallet?.credits_balance || 0}</p>
        </div>
        <div className="text-right">
          <p className="text-sm opacity-90">Accuracy</p>
          <p className="text-2xl font-bold">{wallet?.accuracy_rate?.toFixed(1) || 0}%</p>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-white/20">
        <div>
          <p className="text-xs opacity-75">Total Plays</p>
          <p className="text-lg font-semibold">{wallet?.total_predictions || 0}</p>
        </div>
        <div>
          <p className="text-xs opacity-75">Wins</p>
          <p className="text-lg font-semibold">{wallet?.total_won || 0}</p>
        </div>
        <div>
          <p className="text-xs opacity-75">Skill Score</p>
          <p className="text-lg font-semibold">{wallet?.skill_score || 0}</p>
        </div>
      </div>
    </div>
  )
}
