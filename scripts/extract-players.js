require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Store all player stats
const playerStats = {};

// Helper to calculate strike rate
function calcSR(runs, balls) {
  return balls > 0 ? ((runs / balls) * 100).toFixed(2) : 0;
}

// Helper to calculate economy
function calcEconomy(runs, balls) {
  const overs = balls / 6;
  return overs > 0 ? (runs / overs).toFixed(2) : 0;
}

// Determine batting bucket
function getBatBucket(innings, runs, sr) {
  if (innings < 5) return 'Emerging';
  const avgRuns = runs / innings;
  if (sr > 150 && avgRuns > 25) return 'Opener';
  if (sr > 140) return 'Top-order';
  if (sr > 120) return 'Middle';
  return 'Lower';
}

// Determine bowling bucket
function getBowlBucket(overs, economy) {
  if (overs < 10) return 'Part-time';
  if (economy < 7.5) return 'PP';
  if (economy < 9) return 'Middle';
  return 'Death';
}

// Determine fantasy role
function getFantasyRole(role, batBucket, bowlBucket, batInnings, bowlInnings) {
  if (role === 'WK') {
    return batBucket === 'Opener' ? 'WK_OPENER' : 'WK_FINISHER';
  }
  if (role === 'AR') {
    return bowlInnings >= 10 ? 'AR_4OVERS' : 'AR_PARTTIME';
  }
  if (role === 'BOWL') {
    if (bowlBucket === 'Death') return 'DEATH_PACER';
    if (bowlBucket === 'PP') return 'PP_SWING';
    return 'MIDDLE_SPIN';
  }
  // BAT role
  if (batBucket === 'Opener') return 'ANCHOR';
  return 'POWER_HITTER';
}

// Calculate value score
function calculateValue(batImpact, bowlImpact, role) {
  let value = batImpact + (1.25 * bowlImpact);
  if (role === 'WK') value += 0.10;
  if (role === 'AR') value += 0.20;
  return value.toFixed(2);
}

// Calculate risk band
function getRiskBand(matches, role) {
  let risk = (1 / Math.sqrt(matches));
  if (role === 'BAT') risk += 0.25;
  if (role === 'BOWL') risk += 0.15;
  if (role === 'AR') risk += 0.10;
  if (role === 'WK') risk += 0.12;
  
  if (risk < 0.3) return 'Safe';
  if (risk < 0.5) return 'Moderate';
  return 'High-ceiling';
}

// Process a single match file
function processMatch(filePath) {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const innings = data.innings || [];

  innings.forEach(inning => {
    const battingTeam = inning.team;
    const overs = inning.overs || [];

    overs.forEach(over => {
      const bowler = over.deliveries?.[0]?.bowler;
      
      over.deliveries?.forEach(ball => {
        const batter = ball.batter;
        const runs = ball.runs?.batter || 0;
        const totalRuns = ball.runs?.total || 0;
        const extras = ball.runs?.extras || 0;
        
        // Initialize batter
        if (!playerStats[batter]) {
          playerStats[batter] = {
            name: batter,
            bat_innings: 0,
            bat_runs: 0,
            bat_balls: 0,
            bat_fours: 0,
            bat_sixes: 0,
            bat_high_score: 0,
            bowl_innings: 0,
            bowl_overs: 0,
            bowl_balls: 0,
            bowl_runs: 0,
            bowl_wickets: 0,
            bowl_dots: 0,
            catches: 0,
            stumpings: 0,
            innings_scores: []
          };
        }

        // Update batting stats
        playerStats[batter].bat_balls++;
        playerStats[batter].bat_runs += runs;
        if (runs === 4) playerStats[batter].bat_fours++;
        if (runs === 6) playerStats[batter].bat_sixes++;

        // Initialize bowler
        if (bowler && !playerStats[bowler]) {
          playerStats[bowler] = {
            name: bowler,
            bat_innings: 0,
            bat_runs: 0,
            bat_balls: 0,
            bat_fours: 0,
            bat_sixes: 0,
            bat_high_score: 0,
            bowl_innings: 0,
            bowl_overs: 0,
            bowl_balls: 0,
            bowl_runs: 0,
            bowl_wickets: 0,
            bowl_dots: 0,
            catches: 0,
            stumpings: 0,
            innings_scores: []
          };
        }

        // Update bowling stats
        if (bowler) {
          playerStats[bowler].bowl_balls++;
          playerStats[bowler].bowl_runs += totalRuns;
          if (totalRuns === 0) playerStats[bowler].bowl_dots++;
          
          // Wickets
          if (ball.wickets && ball.wickets.length > 0) {
            playerStats[bowler].bowl_wickets++;
          }
        }

        // Fielding stats
        if (ball.wickets) {
          ball.wickets.forEach(wicket => {
            if (wicket.fielders) {
              wicket.fielders.forEach(fielder => {
                if (fielder.name && playerStats[fielder.name]) {
                  if (wicket.kind === 'stumped') {
                    playerStats[fielder.name].stumpings++;
                  } else if (wicket.kind === 'caught') {
                    playerStats[fielder.name].catches++;
                  }
                }
              });
            }
          });
        }
      });
    });
  });
}

// Main extraction function
async function extractPlayers(folderPath) {
  console.log('🏏 Starting Player Extraction...\n');

  const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.json'));
  console.log(`📂 Found ${files.length} match files\n`);

  // Process all matches
  files.forEach(file => {
    processMatch(path.join(folderPath, file));
  });

  console.log(`\n👥 Found ${Object.keys(playerStats).length} unique players\n`);

  // Calculate derived stats and determine roles
  const players = [];
  for (const [name, stats] of Object.entries(playerStats)) {
    // Skip if player has no meaningful stats
    if (stats.bat_balls < 10 && stats.bowl_balls < 12) continue;

    // Determine role
    let role = 'BAT';
    if (stats.bowl_balls >= 60) role = 'BOWL';
    if (stats.bat_balls >= 30 && stats.bowl_balls >= 30) role = 'AR';
    // WK detection (has stumpings or many catches as keeper)
    if (stats.stumpings > 0 || (stats.catches > 10 && stats.bat_balls > 50)) {
      role = 'WK';
    }

    // Calculate batting metrics
    const bat_sr = parseFloat(calcSR(stats.bat_runs, stats.bat_balls));
    const bat_avg = stats.bat_innings > 0 ? (stats.bat_runs / stats.bat_innings).toFixed(2) : 0;
    
    // Calculate bowling metrics
    const bowl_overs = (stats.bowl_balls / 6).toFixed(1);
    const bowl_economy = parseFloat(calcEconomy(stats.bowl_runs, stats.bowl_balls));
    const bowl_avg = stats.bowl_wickets > 0 ? (stats.bowl_runs / stats.bowl_wickets).toFixed(2) : 0;

    // Fantasy analytics
    const bat_bucket = getBatBucket(stats.bat_innings || 1, stats.bat_runs, bat_sr);
    const bowl_bucket = getBowlBucket(parseFloat(bowl_overs), bowl_economy);
    const fantasy_role = getFantasyRole(role, bat_bucket, bowl_bucket, stats.bat_innings || 0, stats.bowl_innings || 0);

    // Value score
    const matches = Math.max(stats.bat_innings || 1, stats.bowl_innings || 1);
    const runs_per_match = stats.bat_runs / matches;
    const bat_impact = runs_per_match * (bat_sr / 130);
    const wkts_per_match = stats.bowl_wickets / matches;
    const bowl_impact = wkts_per_match * (8.2 / (bowl_economy || 8));
    const value_score = calculateValue(bat_impact, bowl_impact, role);

    // Risk band
    const risk_band = getRiskBand(matches, role);

    // Badges
    const is_consistent = matches >= 15 && bat_avg > 25;
    const is_high_sr = bat_sr > 140 && stats.bat_balls > 50;
    const is_wicket_threat = stats.bowl_wickets > 15;
    const is_economy_king = bowl_economy < 7.5 && stats.bowl_balls > 100;
    const is_all_round_package = role === 'AR' && bat_sr > 120 && bowl_economy < 9;

    // Cap unrealistic values (edge cases with small sample sizes)
    const cappedBatSR = Math.min(bat_sr, 999.99);
    const cappedBatAvg = Math.min(parseFloat(bat_avg), 999.99);
    const cappedBowlEcon = Math.min(bowl_economy, 99.99);
    const cappedBowlAvg = Math.min(parseFloat(bowl_avg), 999.99);
    const cappedValueScore = Math.min(parseFloat(value_score), 999.99);

    players.push({
      name,
      role,
      is_overseas: false, // We'll need to manually set this or detect from names
      bat_innings: stats.bat_innings || Math.ceil(stats.bat_balls / 20),
      bat_runs: stats.bat_runs,
      bat_balls_faced: stats.bat_balls,
      bat_fours: stats.bat_fours,
      bat_sixes: stats.bat_sixes,
      bat_high_score: stats.bat_high_score,
      bat_strike_rate: cappedBatSR,
      bat_average: cappedBatAvg,
      bowl_innings: stats.bowl_innings || (stats.bowl_balls > 0 ? Math.ceil(stats.bowl_balls / 24) : 0),
      bowl_overs: parseFloat(bowl_overs),
      bowl_runs: stats.bowl_runs,
      bowl_wickets: stats.bowl_wickets,
      bowl_dots: stats.bowl_dots,
      bowl_economy: cappedBowlEcon,
      bowl_average: cappedBowlAvg,
      catches: stats.catches,
      stumpings: stats.stumpings,
      bat_bucket,
      bowl_bucket,
      fantasy_role,
      value_score: cappedValueScore,
      risk_band,
      is_consistent,
      is_high_sr,
      is_wicket_threat,
      is_economy_king,
      is_all_round_package
    });
  }

  // Sort by value score
  players.sort((a, b) => b.value_score - a.value_score);

  console.log('💾 Inserting players into database...\n');

  // Insert in batches
  const batchSize = 50;
  let inserted = 0;
  let failed = 0;

  for (let i = 0; i < players.length; i += batchSize) {
    const batch = players.slice(i, i + batchSize);
    const { error } = await supabase.from('players').insert(batch);
    
    if (error) {
      console.error(`❌ Batch ${i / batchSize + 1} failed:`, error.message);
      failed += batch.length;
    } else {
      inserted += batch.length;
      console.log(`✅ Inserted ${inserted}/${players.length} players`);
    }
  }

  console.log('\n📊 Extraction Summary:');
  console.log(`✅ Success: ${inserted}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Total: ${players.length}\n`);
  console.log('🎉 Player extraction complete!\n');

  // Show top 10 players
  console.log('🏆 Top 10 Players by Value:');
  players.slice(0, 10).forEach((p, i) => {
    console.log(`${i + 1}. ${p.name} (${p.fantasy_role}) - ${p.value_score}`);
  });
}

// Run
const folderPath = process.argv[2] || 'psl_json';
extractPlayers(folderPath).catch(console.error);
