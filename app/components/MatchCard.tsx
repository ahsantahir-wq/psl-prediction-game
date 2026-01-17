import { Match } from '@/types'

interface MatchCardProps {
  match: Match
  onPredict?: (match: Match) => void
  onPredictionSuccess?: () => void
}

export default function MatchCard({ match, onPredict, onPredictionSuccess }: MatchCardProps) {
  // Team logos from Supabase Storage
  const getTeamLogo = (teamName: string) => {
    const baseUrl = 'https://wmuibafrpidgwaidekrj.supabase.co/storage/v1/object/public/team-logos'
    
    const logos: { [key: string]: string } = {
      'Karachi Kings': `${baseUrl}/Karachi_Kings.png`,
      'Lahore Qalandars': `${baseUrl}/Lahore_Qalandars.png`,
      'Islamabad United': `${baseUrl}/Islamabad_United.png`,
      'Multan Sultans': `${baseUrl}/MultanSultans.png`,
      'Peshawar Zalmi': `${baseUrl}/Peshawar_Zalmi_logo.png`,
      'Quetta Gladiators': `${baseUrl}/Quetta_Gladiators.png`,
    }
    return logos[teamName] || '/placeholder-team.png'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg border border-gray-700">
      {/* Header */}
      <div className="p-4 bg-gray-900 flex justify-between items-center">
        <div className="flex items-center gap-2">
          {match.status === 'live' && (
            <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
              LIVE
            </span>
          )}
          {match.status === 'upcoming' && (
            <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold">
              UPCOMING
            </span>
          )}
          {match.status === 'completed' && (
            <span className="bg-gray-600 text-white px-3 py-1 rounded-full text-xs font-bold">
              COMPLETED
            </span>
          )}
        </div>
        <span className="text-gray-400 text-sm">{formatDate(match.date)}</span>
      </div>

      {/* Teams Section */}
      <div className="p-6">
        <div className="flex items-center justify-between gap-6">
          {/* Team A */}
          <div className="flex flex-col items-center flex-1">
            <div className="w-20 h-20 mb-3 bg-white rounded-full p-2 flex items-center justify-center">
              <img
                src={getTeamLogo(match.team_a)}
                alt={match.team_a}
                className="w-full h-full object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23374151" width="100" height="100"/%3E%3Ctext x="50" y="50" font-size="40" text-anchor="middle" dy=".3em" fill="%239CA3AF"%3E🏏%3C/text%3E%3C/svg%3E'
                }}
              />
            </div>
            <h3 className="text-white font-bold text-center text-sm">
              {match.team_a}
            </h3>
            {match.status === 'live' && match.current_score_a !== undefined && (
              <p className="text-green-400 font-bold text-lg mt-1">
                {match.current_score_a}/{match.current_wickets_a || 0}
                <span className="text-gray-400 text-sm ml-1">
                  ({Math.floor((match.ball_number || 0) / 6)}.{(match.ball_number || 0) % 6})
                </span>
              </p>
            )}
          </div>

          {/* VS */}
          <div className="text-gray-500 font-bold text-2xl">VS</div>

          {/* Team B */}
          <div className="flex flex-col items-center flex-1">
            <div className="w-20 h-20 mb-3 bg-white rounded-full p-2 flex items-center justify-center">
              <img
                src={getTeamLogo(match.team_b)}
                alt={match.team_b}
                className="w-full h-full object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23374151" width="100" height="100"/%3E%3Ctext x="50" y="50" font-size="40" text-anchor="middle" dy=".3em" fill="%239CA3AF"%3E🏏%3C/text%3E%3C/svg%3E'
                }}
              />
            </div>
            <h3 className="text-white font-bold text-center text-sm">
              {match.team_b}
            </h3>
            {match.score && (
              <p className="text-green-400 font-bold text-lg mt-1">
                {match.score.team_b.runs}/{match.score.team_b.wickets}
                <span className="text-gray-400 text-sm ml-1">
                  ({match.score.team_b.overs})
                </span>
              </p>
            )}
          </div>
        </div>

        {/* Current Over Info for Live Matches */}
        {match.status === 'live' && match.current_over !== undefined && (
          <div className="mt-4 text-center text-gray-400 text-sm">
            Over {match.current_over}.{match.current_ball || 0} in progress
          </div>
        )}
      </div>

      {/* Action Button */}
      {match.status === 'live' && onPredict && (
        <div className="px-6 pb-6">
          <button
            onClick={() => onPredict(match)}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition"
          >
            Make Prediction
          </button>
        </div>
      )}

      {match.status === 'upcoming' && (
        <div className="px-6 pb-6">
          <button
            disabled
            className="w-full bg-gray-600 text-gray-400 font-bold py-3 rounded-lg cursor-not-allowed"
          >
            Match Not Started
          </button>
        </div>
      )}

      {match.status === 'completed' && (
        <div className="px-6 pb-6">
          <button
            disabled
            className="w-full bg-gray-700 text-gray-400 font-bold py-3 rounded-lg cursor-not-allowed"
          >
            Match Ended
          </button>
        </div>
      )}
    </div>
  )
}
