import type { Player } from './playerService';

export interface TeamLineup {
  players: Player[];
  currentBatters: [Player, Player];
  currentBowler: Player;
}

export interface MatchState {
  currentInnings: number;
  totalOvers: number;
  currentOver: number;
  currentBall: number;
  runs: number;
  wickets: number;
}

export interface BallResult {
  runs: number;
  isWicket: boolean;
  extras: number;
  batterName: string;
  bowlerName: string;
  commentary: string;
}

export function simulateBall(
  state: MatchState,
  team1Lineup?: TeamLineup,
  team2Lineup?: TeamLineup
): BallResult {
  // Simulate ball outcome
  const outcomes = [0, 0, 1, 2, 4, 6, 'W', 4, 6];
  const result = outcomes[Math.floor(Math.random() * outcomes.length)];
  const isWicket = result === 'W';
  const runs = isWicket ? 0 : (result as number);
  const extras = 0;

  // Get current players
  let batterName = 'Batter';
  let bowlerName = 'Bowler';
  
  if (state.currentInnings === 1 && team1Lineup) {
    const [striker] = team1Lineup.currentBatters;
    batterName = striker.name;
    if (team2Lineup?.currentBowler) {
      bowlerName = team2Lineup.currentBowler.name;
    }
  } else if (state.currentInnings === 2 && team2Lineup) {
    const [striker] = team2Lineup.currentBatters;
    batterName = striker.name;
    if (team1Lineup?.currentBowler) {
      bowlerName = team1Lineup.currentBowler.name;
    }
  }

  // Generate commentary
  let commentary = `${bowlerName} to ${batterName}`;
  if (isWicket) {
    commentary += ', WICKET!';
  } else if (runs === 6) {
    commentary += ', SIX!';
  } else if (runs === 4) {
    commentary += ', FOUR!';
  } else if (runs === 0) {
    commentary += ', dot ball';
  } else {
    commentary += `, ${runs} ${runs === 1 ? 'run' : 'runs'}`;
  }

  return {
    runs,
    isWicket,
    extras,
    batterName,
    bowlerName,
    commentary,
  };
}
