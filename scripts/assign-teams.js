require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Team mapping from match data
const teamPlayerMap = {};

async function assignTeams(folderPath) {
  console.log('🔗 Assigning players to teams...\n');

  // Get all teams
  const { data: teams, error: teamError } = await supabase
    .from('teams')
    .select('id, name');

  if (teamError) {
    console.error('❌ Failed to fetch teams:', teamError);
    return;
  }

  const teamMap = {};
  teams.forEach(t => {
    teamMap[t.name] = t.id;
  });

  // Read all match files
  const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.json'));
  
  files.forEach(file => {
    const data = JSON.parse(fs.readFileSync(path.join(folderPath, file), 'utf-8'));
    const info = data.info || {};
    const teams = info.teams || [];
    const innings = data.innings || [];

    innings.forEach(inning => {
      const team = inning.team;
      const overs = inning.overs || [];

      overs.forEach(over => {
        const bowler = over.deliveries?.[0]?.bowler;
        
        over.deliveries?.forEach(ball => {
          const batter = ball.batter;
          const nonStriker = ball.non_striker;

          // Assign batters to batting team
          if (batter && team) {
            if (!teamPlayerMap[batter]) teamPlayerMap[batter] = [];
            if (!teamPlayerMap[batter].includes(team)) {
              teamPlayerMap[batter].push(team);
            }
          }

          if (nonStriker && team) {
            if (!teamPlayerMap[nonStriker]) teamPlayerMap[nonStriker] = [];
            if (!teamPlayerMap[nonStriker].includes(team)) {
              teamPlayerMap[nonStriker].push(team);
            }
          }

          // Assign bowler to bowling team (opposite team)
          if (bowler && teams.length === 2) {
            const bowlingTeam = teams.find(t => t !== team);
            if (bowlingTeam) {
              if (!teamPlayerMap[bowler]) teamPlayerMap[bowler] = [];
              if (!teamPlayerMap[bowler].includes(bowlingTeam)) {
                teamPlayerMap[bowler].push(bowlingTeam);
              }
            }
          }
        });
      });
    });
  });

  console.log(`📋 Mapped ${Object.keys(teamPlayerMap).length} players to teams\n`);

  // Update players in database
  let updated = 0;
  let notFound = 0;

  for (const [playerName, playerTeams] of Object.entries(teamPlayerMap)) {
    // Use the team they played for most frequently (first in array for simplicity)
    const primaryTeam = playerTeams[0];
    const teamId = teamMap[primaryTeam];

    if (teamId) {
      const { error } = await supabase
        .from('players')
        .update({ team_id: teamId })
        .eq('name', playerName);

      if (!error) {
        updated++;
        if (updated % 50 === 0) {
          console.log(`✅ Updated ${updated} players...`);
        }
      }
    } else {
      notFound++;
    }
  }

  console.log('\n📊 Assignment Summary:');
  console.log(`✅ Assigned: ${updated}`);
  console.log(`⚠️  Not matched: ${notFound}`);
  console.log('\n🎉 Team assignment complete!\n');
}

const folderPath = process.argv[2] || 'psl_json';
assignTeams(folderPath).catch(console.error);
