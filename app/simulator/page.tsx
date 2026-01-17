'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { simulateBall, type MatchState, type BallResult } from '@/lib/cricketEngine';
import { getTeamPlayers, type Player } from '@/lib/playerService';

export default function SimulatorPage() {
  const [teams, setTeams] = useState<any[]>([]);
  const [team1, setTeam1] = useState<string>('');
  const [team2, setTeam2] = useState<string>('');
  const [team1Players, setTeam1Players] = useState<Player[]>([]);
  const [team2Players, setTeam2Players] = useState<Player[]>([]);
  const [matchState, setMatchState] = useState<MatchState | null>(null);
  const [ballLog, setBallLog] = useState<BallResult[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    fetchTeams();
  }, []);

  async function fetchTeams() {
    const { data } = await supabase.from('teams').select('*');
    setTeams(data || []);
  }

  async function loadPlayers(teamId: string, setPlayers: (p: Player[]) => void) {
    const players = await getTeamPlayers(teamId);
    setPlayers(players);
  }

  function startMatch() {
    if (!team1 || !team2) return;
    
    const state: MatchState = {
      currentInnings: 1,
      totalOvers: 20,
      currentOver: 0,
      currentBall: 0,
      runs: 0,
      wickets: 0,
    };
    
    setMatchState(state);
    setBallLog([]);
  }

  function simulateNextBall() {
    if (!matchState) return;
    
    const result = simulateBall(matchState);
    setBallLog(prev => [result, ...prev]);
    
    // Update state based on result
    const newState = { ...matchState };
    newState.runs += result.runs;
    if (result.isWicket) newState.wickets++;
    
    // Update ball/over
    newState.currentBall++;
    if (newState.currentBall === 6) {
      newState.currentBall = 0;
      newState.currentOver++;
    }
    
    setMatchState(newState);
  }

  async function autoSimulate() {
    setIsSimulating(true);
    const interval = setInterval(() => {
      simulateNextBall();
    }, 500);
    
    setTimeout(() => {
      clearInterval(interval);
      setIsSimulating(false);
    }, 10000);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold text-white mb-8 text-center">🏏 Match Simulator</h1>

        {/* Team Selection */}
        {!matchState && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-8">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="text-white font-semibold mb-2 block">Team 1</label>
                <select
                  className="w-full p-3 rounded-lg bg-white/20 text-white border border-white/30"
                  value={team1}
                  onChange={(e) => {
                    setTeam1(e.target.value);
                    loadPlayers(e.target.value, setTeam1Players);
                  }}
                >
                  <option value="">Select Team</option>
                  {teams.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="text-white font-semibold mb-2 block">Team 2</label>
                <select
                  className="w-full p-3 rounded-lg bg-white/20 text-white border border-white/30"
                  value={team2}
                  onChange={(e) => {
                    setTeam2(e.target.value);
                    loadPlayers(e.target.value, setTeam2Players);
                  }}
                >
                  <option value="">Select Team</option>
                  {teams.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <button
              onClick={startMatch}
              disabled={!team1 || !team2}
              className="mt-6 w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold py-4 rounded-xl hover:scale-105 transition disabled:opacity-50"
            >
              🚀 Start Match
            </button>
          </div>
        )}

        {/* Live Match */}
        {matchState && (
          <>
            {/* Scoreboard */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-8">
              <div className="text-center mb-6">
                <div className="text-5xl font-bold text-white">
                  {matchState.runs}/{matchState.wickets}
                </div>
                <div className="text-white/70 mt-2">
                  Overs: {matchState.currentOver}.{matchState.currentBall}
                </div>
              </div>

              {/* Controls */}
              <div className="flex gap-4">
                <button
                  onClick={simulateNextBall}
                  disabled={isSimulating}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-lg disabled:opacity-50"
                >
                  ⚡ Next Ball
                </button>
                <button
                  onClick={autoSimulate}
                  disabled={isSimulating}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg disabled:opacity-50"
                >
                  🎬 Auto Play
                </button>
              </div>
            </div>

            {/* Ball-by-Ball Log */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-white mb-4">📝 Commentary</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {ballLog.map((ball, i) => (
                  <div key={i} className="p-3 bg-white/5 rounded-lg text-white">
                    {ball.commentary}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
