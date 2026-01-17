'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Player } from '@/lib/playerService';

export default function AnalyticsPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [filter, setFilter] = useState<'all' | 'BAT' | 'BOWL' | 'AR' | 'WK'>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchPlayers();
  }, [filter]);

  async function fetchPlayers() {
    let query = supabase
      .from('players')
      .select('*, teams(name, short_name)')
      .order('value_score', { ascending: false });

    if (filter !== 'all') {
      query = query.eq('role', filter);
    }

    const { data } = await query.limit(100);
    setPlayers(data || []);
  }

  const filteredPlayers = players.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold text-white mb-8">📊 Player Analytics</h1>

        {/* Filters */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8">
          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="🔍 Search players..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="p-3 rounded-lg bg-white/20 text-white placeholder-white/50 border border-white/30"
            />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="p-3 rounded-lg bg-white/20 text-white border border-white/30"
            >
              <option value="all">All Players</option>
              <option value="BAT">Batsmen</option>
              <option value="BOWL">Bowlers</option>
              <option value="AR">All-Rounders</option>
              <option value="WK">Wicket-Keepers</option>
            </select>
          </div>
        </div>

        {/* Player Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlayers.map(player => (
            <div key={player.id} className="bg-white/10 backdrop-blur-lg rounded-xl p-6 hover:bg-white/20 transition">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">{player.name}</h3>
                  <p className="text-white/70">{(player as any).teams?.name || 'No Team'}</p>
                </div>
                <span className="px-3 py-1 bg-yellow-400/20 text-yellow-300 rounded-full text-sm font-bold">
                  {player.role}
                </span>
              </div>

              {/* Stats */}
              <div className="space-y-2 mb-4">
                {(player.role === 'BAT' || player.role === 'AR' || player.role === 'WK') && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/70">Runs</span>
                      <span className="text-white font-bold">{player.bat_runs}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/70">Strike Rate</span>
                      <span className="text-white font-bold">{player.bat_strike_rate?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/70">Average</span>
                      <span className="text-white font-bold">{player.bat_average?.toFixed(2)}</span>
                    </div>
                  </>
                )}
                {(player.role === 'BOWL' || player.role === 'AR') && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/70">Wickets</span>
                      <span className="text-white font-bold">{player.bowl_wickets}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/70">Economy</span>
                      <span className="text-white font-bold">{player.bowl_economy?.toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                {player.is_consistent && (
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">
                    🎯 Consistent
                  </span>
                )}
                {player.is_high_sr && (
                  <span className="px-2 py-1 bg-red-500/20 text-red-300 rounded text-xs">
                    ⚡ High SR
                  </span>
                )}
                {player.is_wicket_threat && (
                  <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs">
                    🎳 Wicket Threat
                  </span>
                )}
                {player.is_economy_king && (
                  <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs">
                    💎 Economy King
                  </span>
                )}
              </div>

              {/* Value Score */}
              <div className="pt-4 border-t border-white/20">
                <div className="flex justify-between items-center">
                  <span className="text-white/70 text-sm">Value Score</span>
                  <span className="text-2xl font-bold text-yellow-400">
                    {player.value_score?.toFixed(1)}
                  </span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2 mt-2">
                  <div
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full"
                    style={{ width: `${Math.min((player.value_score / 10) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
