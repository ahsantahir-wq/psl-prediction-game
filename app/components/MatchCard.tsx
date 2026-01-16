'use client'

import { useState } from 'react'
import { Match } from '@/app/types'
import PredictionModal from './PredictionModal'

interface MatchCardProps {
  match: Match
  onPredictionSuccess?: () => void
}

export default function MatchCard({ match, onPredictionSuccess }: MatchCardProps) {
  const [showModal, setShowModal] = useState(false)

  const battingTeam = match.batting_team === 'team_a' ? match.team_a : match.team_b
  const currentScore = match.batting_team === 'team_a' 
    ? match.current_score_a 
    : match.current_score_b

  return (
    <>
      <div className="bg-white rounded-xl shadow-md overflow-hidden border-2 border-gray-100 hover:border-blue-300 transition">
        {/* Match Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold uppercase">
              {match.status === 'live' ? '🔴 Live' : '⏰ Upcoming'}
            </span>
            <span className="text-xs opacity-90">
              {new Date(match.match_date).toLocaleDateString()}
            </span>
          </div>
          <div className="text-center">
            <h3 className="text-xl font-bold">
              {match.team_a} vs {match.team_b}
            </h3>
          </div>
        </div>

        {/* Match Status */}
        {match.status === 'live' && (
          <div className="bg-gray-50 p-4 border-b">
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">
                {battingTeam} Batting
              </div>
              <div className="text-3xl font-bold text-gray-800">
                {currentScore || 0}/{(match as any).current_wickets || 0}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Over {match.current_over || 0}
              </div>
            </div>
          </div>
        )}

        {/* Predict Button */}
        <div className="p-4">
          {match.status === 'live' ? (
            <button
              onClick={() => setShowModal(true)}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg font-bold hover:from-green-600 hover:to-green-700 transition"
            >
              🎯 Make Prediction
            </button>
          ) : (
            <button
              disabled
              className="w-full bg-gray-200 text-gray-500 py-3 rounded-lg font-bold cursor-not-allowed"
            >
              ⏰ Match Not Started
            </button>
          )}
        </div>
      </div>

      {/* Prediction Modal */}
      {showModal && (
        <PredictionModal
          match={match}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false)
            if (onPredictionSuccess) onPredictionSuccess()
          }}
        />
      )}
    </>
  )
}
