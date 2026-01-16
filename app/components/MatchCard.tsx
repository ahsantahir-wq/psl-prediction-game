import { Match } from '@/types'
import Image from 'next/image'

interface MatchCardProps {
  match: Match
  onPredict?: (matchId: string) => void
  onPredictionSuccess?: () => void
}

export default function MatchCard({ match, onPredict, onPredictionSuccess }: MatchCardProps) {
  const getStatusColor = () => {
    switch (match.status) {
      case 'live': return 'bg-red-500'
      case 'upcoming': return 'bg-blue-500'
      case 'completed': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700">
      {/* Status Badge */}
      <div className="flex justify-between items-center mb-4">
        <span className={`${getStatusColor()} text-white px-3 py-1 rounded-full text-sm font-semibold uppercase`}>
          {match.status}
        </span>
        <span className="text-gray-400 text-sm">
          {new Date(match.date).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </span>
      </div>

      {/* Teams with Logos */}
      <div className="flex justify-between items-center mb-6">
        {/* Team A */}
        <div className="flex flex-col items-center gap-2 flex-1">
          <div className="relative w-16 h-16 flex items-center justify-center">
            <Image 
              src={match.team_a_logo} 
              alt={match.team_a}
              width={64}
              height={64}
              className="object-contain"
              unoptimized
            />
          </div>
          <span className="font-bold text-white text-center text-sm">
            {match.team_a}
          </span>
          {match.score && (
            <span className="text-green-400 font-bold text-lg">
              {match.score.team_a.runs}/{match.score.team_a.wickets}
              <span className="text-gray-400 text-sm ml-1">
                ({match.score.team_a.overs})
              </span>
            </span>
          )}
        </div>

        {/* VS */}
        <div className="text-gray-400 font-bold text-2xl mx-4">VS</div>

        {/* Team B */}
        <div className="flex flex-col items-center gap-2 flex-1">
          <div className="relative w-16 h-16 flex items-center justify-center">
            <Image 
              src={match.team_b_logo} 
              alt={match.team_b}
              width={64}
              height={64}
              className="object-contain"
              unoptimized
            />
          </div>
          <span className="font-bold text-white text-center text-sm">
            {match.team_b}
          </span>
          {match.score && (
            <span className="text-green-400 font-bold text-lg">
              {match.score.team_b.runs}/{match.score.team_b.wickets}
              <span className="text-gray-400 text-sm ml-1">
                ({match.score.team_b.overs})
              </span>
            </span>
          )}
        </div>
      </div>

      {/* Live indicator */}
      {match.status === 'live' && (
        <div className="bg-red-500 bg-opacity-20 border border-red-500 rounded p-3 mb-4">
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-red-400 font-semibold text-sm">
              Over {match.current_over}.{match.current_ball} in progress
            </span>
          </div>
        </div>
      )}

      {/* Predict Button */}
      {match.status === 'live' && onPredict && (
        <button
          onClick={() => onPredict(match.id)}
          className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-semibold"
        >
          Make Prediction
        </button>
      )}

      {match.status === 'upcoming' && (
        <div className="text-center text-gray-400 text-sm">
          Predictions will open when match goes live
        </div>
      )}

      {match.status === 'completed' && (
        <div className="text-center text-green-400 font-semibold">
          Match Completed
        </div>
      )}
    </div>
  )
}
