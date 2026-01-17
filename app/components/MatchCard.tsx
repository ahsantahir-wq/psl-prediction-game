import { Match } from '@/types'
import TeamLogo from './TeamLogo'

interface MatchCardProps {
  match: Match
  onPredict?: (match: Match) => void
  onPredictionSuccess?: () => void
}

export default function MatchCard({ match, onPredict }: MatchCardProps) {

  const getStatusBadge = () => {
    switch (match.status) {
      case 'live':
        return (
          <div className="flex items-center gap-2 px-4 py-2 bg-red-500/20 border-2 border-red-500 rounded-lg">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-red-500 font-bold text-sm uppercase tracking-wider">
              Live Now
            </span>
          </div>
        )
      case 'upcoming':
        return (
          <div className="px-4 py-2 bg-amber-500/20 border-2 border-amber-500 rounded-lg">
            <span className="text-amber-500 font-semibold text-sm uppercase tracking-wide">
              Upcoming
            </span>
          </div>
        )
      case 'completed':
        return (
          <div className="px-4 py-2 bg-slate-500/20 border-2 border-slate-500 rounded-lg">
            <span className="text-slate-400 font-semibold text-sm uppercase tracking-wide">
              Completed
            </span>
          </div>
        )
      default:
        return null
    }
  }

  const formatMatchTime = () => {
    const date = new Date(match.match_date)
    const now = new Date()
    const diffMs = date.getTime() - now.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

    if (match.status === 'live') {
      return `Over ${match.current_over || 0}`
    }

    if (match.status === 'upcoming') {
      if (diffHours < 24) {
        return diffHours > 0 
          ? `Starts in ${diffHours}h ${diffMins}m`
          : `Starts in ${diffMins}m`
      }
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    return 'Match Ended'
  }

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden hover:border-teal-500 transition-all">
      {/* Status Header */}
      <div className="bg-slate-900/50 px-6 py-4 border-b border-slate-700">
        <div className="flex items-center justify-between">
          {getStatusBadge()}
          <div className="text-slate-400 text-sm font-medium">
            {formatMatchTime()}
          </div>
        </div>
        {match.venue && (
          <div className="text-slate-500 text-xs mt-2">📍 {match.venue}</div>
        )}
      </div>

      {/* Teams Section */}
      <div className="p-6">
        {/* Team A */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-700">
          <div className="flex items-center gap-4">
            <TeamLogo teamName={match.team_a} size={48} />
            <div>
              <div className="text-lg font-bold text-white">{match.team_a}</div>
              {match.status === 'live' && match.batting_team === match.team_a && (
                <div className="text-xs text-teal-400 font-semibold">• Batting</div>
              )}
            </div>
          </div>
          
          {match.status !== 'upcoming' && (
            <div className="text-right">
              <div className="text-2xl font-bold text-white">
                {match.current_score_a || 0}/{match.current_wickets_a || 0}
              </div>
              {match.status === 'live' && (
                <div className="text-xs text-slate-400">
                  ({match.current_over || 0} overs)
                </div>
              )}
            </div>
          )}
        </div>

        {/* Team B */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <TeamLogo teamName={match.team_b} size={48} />
            <div>
              <div className="text-lg font-bold text-white">{match.team_b}</div>
              {match.status === 'live' && match.batting_team === match.team_b && (
                <div className="text-xs text-teal-400 font-semibold">• Batting</div>
              )}
            </div>
          </div>
          
          {match.status !== 'upcoming' && (
            <div className="text-right">
              <div className="text-2xl font-bold text-white">
                {match.current_score_b || 0}/{match.current_wickets_b || 0}
              </div>
              {match.status === 'live' && (
                <div className="text-xs text-slate-400">
                  ({match.current_over || 0} overs)
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Button */}
        {onPredict && (
          <button
            onClick={() => onPredict(match)}
            disabled={match.status === 'completed'}
            className={`w-full py-3 px-4 rounded-lg font-semibold transition-all mt-4 ${
              match.status === 'live'
                ? 'bg-teal-500 hover:bg-teal-600 text-white'
                : match.status === 'upcoming'
                ? 'bg-amber-500/20 text-amber-400 border-2 border-amber-500/50 hover:bg-amber-500/30'
                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
            }`}
          >
            {match.status === 'live' && '🎯 Make Prediction'}
            {match.status === 'upcoming' && '⏳ Pre-Match Predictions'}
            {match.status === 'completed' && '✓ Match Ended'}
          </button>
        )}
      </div>
    </div>
  )
}
