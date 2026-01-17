'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Match } from '@/types';
import TeamLogo from './TeamLogo';

export default function LiveMatchFeed() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMatches();
    
    const channel = supabase
      .channel('matches-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'matches' },
        () => loadMatches()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function loadMatches() {
    console.log('🔍 Loading live matches...');
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .eq('status', 'live')
      .order('match_date', { ascending: true });

    if (error) {
      console.error('❌ Error loading matches:', error);
    } else {
      console.log('✅ Live matches loaded:', data?.length || 0);
      setMatches(data || []);
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
        <p className="text-gray-500 text-sm">No live matches at the moment</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {matches.map((match) => (
        <div key={match.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <span className="px-2 py-1 rounded text-[10px] font-bold tracking-wider uppercase bg-red-100 text-red-600">
              • LIVE
            </span>
            <span className="text-[11px] text-gray-400">{match.venue}</span>
          </div>

          {/* Teams */}
          <div className="space-y-4 mb-4">
            {/* Team A */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <TeamLogo teamName={match.team_a} size={32} />
                <span className="font-bold text-gray-800">{match.team_a}</span>
              </div>
              <span className="font-black text-lg">
                {match.current_score_a || 0}/{match.current_wickets_a || 0}
              </span>
            </div>

            {/* Team B */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <TeamLogo teamName={match.team_b} size={32} />
                <span className="font-bold text-gray-800">{match.team_b}</span>
              </div>
              <span className="font-black text-lg">
                {match.current_score_b || 0}/{match.current_wickets_b || 0}
              </span>
            </div>
          </div>

          {/* Match Info */}
          <div className="pt-4 border-t border-dashed border-gray-100 flex justify-between items-center">
            <span className="text-xs text-gray-500">
              Over {match.current_over || 0}.{match.ball_number || 0}
            </span>
            {match.batting_team && (
              <span className="text-xs font-bold text-teal-600">
                Batting: {match.batting_team}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
