import { supabase } from './supabase';

export interface Player {
  id: string;
  name: string;
  team_id: string;
  role: 'BAT' | 'BOWL' | 'AR' | 'WK';
  bat_strike_rate: number;
  bat_average: number;
  bowl_economy: number;
  bowl_average: number;
  fantasy_role: string;
  value_score: number;
  risk_band: string;
  is_consistent: boolean;
  is_high_sr: boolean;
  is_wicket_threat: boolean;
  is_economy_king: boolean;
  is_all_round_package: boolean;
}

export async function getTeamPlayers(teamId: string): Promise<Player[]> {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('team_id', teamId)
    .order('value_score', { ascending: false });

  if (error) {
    console.error('Error fetching players:', error);
    return [];
  }

  return data || [];
}

export async function getPlayersByRole(
  teamId: string,
  role: string
): Promise<Player[]> {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('team_id', teamId)
    .eq('role', role)
    .order('value_score', { ascending: false });

  if (error) return [];
  return data || [];
}

export async function getTopPlayers(limit: number = 10): Promise<Player[]> {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .order('value_score', { ascending: false })
    .limit(limit);

  if (error) return [];
  return data || [];
}

export async function getPlayerStats(playerId: string): Promise<Player | null> {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('id', playerId)
    .single();

  if (error) return null;
  return data;
}

// Get random player by role for simulator
export function getRandomPlayerByRole(
  players: Player[],
  role: 'BAT' | 'BOWL' | 'AR' | 'WK'
): Player | null {
  const filtered = players.filter(p => p.role === role || p.role === 'AR');
  if (filtered.length === 0) return null;
  return filtered[Math.floor(Math.random() * filtered.length)];
}

// Get opening batsmen
export function getOpeners(players: Player[]): Player[] {
  return players
    .filter(p => (p.role === 'BAT' || p.role === 'WK' || p.role === 'AR'))
    .sort((a, b) => b.value_score - a.value_score)
    .slice(0, 2);
}

// Get bowlers for powerplay/middle/death
export function getBowlerByPhase(
  players: Player[],
  phase: 'PP' | 'Middle' | 'Death'
): Player | null {
  const bowlers = players.filter(p => 
    p.role === 'BOWL' || p.role === 'AR'
  );

  if (phase === 'PP') {
    // Low economy bowlers
    return bowlers.sort((a, b) => a.bowl_economy - b.bowl_economy)[0] || null;
  } else if (phase === 'Death') {
    // Wicket takers
    return bowlers.sort((a, b) => b.value_score - a.value_score)[0] || null;
  }

  // Middle overs - all rounders
  return bowlers[Math.floor(Math.random() * bowlers.length)] || null;
}
