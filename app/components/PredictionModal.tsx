'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Match, MicroAction } from '@/types'
import TeamLogo from './TeamLogo'

interface PredictionModalProps {
  match: Match
  onClose: () => void
  onSuccess: () => void
}

const MICRO_ACTIONS: MicroAction[] = [
  {
    id: '1',
    name: 'Over Outcome',
    icon: '🎯',
    description: 'Predict runs in next over (0-6, 7-12, 13+)',
    cost: 10,
    potentialWin: 25,
    type: 'over_outcome'
  },
  {
    id: '2',
    name: 'Boundary Rush',
    icon: '⚡',
    description: 'Will next ball be a boundary? (4 or 6)',
    cost: 15,
    potentialWin: 40,
    type: 'boundary_rush'
  },
  {
    id: '3',
    name: 'Wicket Window',
    icon: '🔥',
    description: 'Wicket in next 6 balls?',
    cost: 20,
    potentialWin: 60,
    type: 'wicket_window'
  }
]

export default function PredictionModal({ match, onClose, onSuccess }: PredictionModalProps) {
  const [selectedAction, setSelectedAction] = useState<MicroAction | null>(null)
  const [selectedOption, setSelectedOption] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const getOptions = (actionType: string) => {
    switch (actionType) {
      case 'over_outcome':
        return [
          { value: '0-6', label: '0-6 runs', multiplier: 2.5 },
          { value: '7-12', label: '7-12 runs', multiplier: 2.0 },
          { value: '13+', label: '13+ runs', multiplier: 3.0 }
        ]
      case 'boundary_rush':
        return [
          { value: 'yes', label: 'Yes - Boundary! 🎯', multiplier: 2.5 },
          { value: 'no', label: 'No - Safe Play 🛡️', multiplier: 1.5 }
        ]
      case 'wicket_window':
        return [
          { value: 'yes', label: 'Yes - Wicket Falls! 🔥', multiplier: 3.0 },
          { value: 'no', label: 'No - Batsman Safe 🛡️', multiplier: 1.2 }
        ]
      default:
        return []
    }
  }

  const handleSubmitPrediction = async () => {
    if (!selectedAction || !selectedOption) {
      setError('Please select an option')
      return
    }

    setLoading(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Check wallet balance
      const { data: wallet } = await supabase
        .from('wallet')
        .select('credits_balance')
        .eq('user_id', user.id)
        .single()

      if (!wallet || wallet.credits_balance < selectedAction.cost) {
        throw new Error('Insufficient credits')
      }

      const option = getOptions(selectedAction.type).find(o => o.value === selectedOption)
      const potentialWin = Math.floor(selectedAction.cost * (option?.multiplier || 2))

      // Create prediction
      const { error: predictionError } = await supabase
        .from('predictions')
        .insert({
          user_id: user.id,
          match_id: match.id,
          action_type: selectedAction.type,
          prediction_data: {
            option: selectedOption,
            current_over: match.current_over,
            current_score: match.batting_team === 'team_a' 
              ? match.current_score_a 
              : match.current_score_b
          },
          credits_spent: selectedAction.cost,
          potential_win: potentialWin,
          status: 'pending'
        })

      if (predictionError) throw predictionError

      // Deduct credits
      const { error: walletError } = await supabase
        .from('wallet')
        .update({ 
          credits_balance: wallet.credits_balance - selectedAction.cost,
          total_predictions: (wallet as any).total_predictions + 1
        })
        .eq('user_id', user.id)

      if (walletError) throw walletError

      // Update user stats
      // Update user stats
const { data: currentStats } = await supabase
  .from('user_stats')
  .select('total_predictions, credits_spent')
  .eq('user_id', user.id)
  .single()

if (currentStats) {
  await supabase
    .from('user_stats')
    .update({
      total_predictions: currentStats.total_predictions + 1,
      credits_spent: currentStats.credits_spent + selectedAction.cost
    })
    .eq('user_id', user.id)
}


      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">🎮 Make Your Prediction</h2>
              <p className="text-xs opacity-75">
                Over {match.current_over || 0} • Live Now 🔴
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2"
            >
              ✕
            </button>
          </div>
          
          {/* Team Logos */}
          <div className="flex items-center justify-center gap-4">
            <TeamLogo teamName={match.team_a} size={40} />
            <span className="text-white font-bold text-xl">vs</span>
            <TeamLogo teamName={match.team_b} size={40} />
          </div>
        </div>

        {/* Action Selection */}
        {!selectedAction ? (
          <div className="p-6">
            <h3 className="text-lg font-bold mb-4">Choose Your Action:</h3>
            <div className="space-y-3">
              {MICRO_ACTIONS.map((action) => (
                <button
                  key={action.id}
                  onClick={() => setSelectedAction(action)}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{action.icon}</span>
                      <div>
                        <div className="font-bold text-lg">{action.name}</div>
                        <div className="text-sm text-gray-600">{action.description}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Cost</div>
                      <div className="font-bold text-lg text-green-600">{action.cost} 🪙</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-6">
            {/* Selected Action Header */}
            <div className="mb-6 p-4 bg-blue-50 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{selectedAction.icon}</span>
                <div>
                  <h3 className="font-bold text-lg">{selectedAction.name}</h3>
                  <p className="text-sm text-gray-600">{selectedAction.description}</p>
                </div>
              </div>
              <div className="flex gap-4 mt-3 text-sm">
                <div className="flex-1 bg-white p-2 rounded-lg text-center">
                  <div className="text-gray-600">Cost</div>
                  <div className="font-bold text-red-600">{selectedAction.cost} 🪙</div>
                </div>
                <div className="flex-1 bg-white p-2 rounded-lg text-center">
                  <div className="text-gray-600">Win Up To</div>
                  <div className="font-bold text-green-600">{selectedAction.potentialWin} 🪙</div>
                </div>
              </div>
            </div>

            {/* Options */}
            <h4 className="font-bold mb-3">Select Your Prediction:</h4>
            <div className="space-y-3">
              {getOptions(selectedAction.type).map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedOption(option.value)}
                  className={`w-full p-4 border-2 rounded-xl transition ${
                    selectedOption === option.value
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-blue-500'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">{option.label}</span>
                    <span className="text-sm text-green-600 font-bold">
                      {option.multiplier}x
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* Error */}
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                ❌ {error}
              </div>
            )}

            {/* Actions */}
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setSelectedAction(null)
                  setSelectedOption('')
                  setError('')
                }}
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50"
              >
                ← Back
              </button>
              <button
                onClick={handleSubmitPrediction}
                disabled={!selectedOption || loading}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 disabled:opacity-50 font-bold"
              >
                {loading ? '⏳ Placing...' : `🎯 Predict for ${selectedAction.cost} 🪙`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
