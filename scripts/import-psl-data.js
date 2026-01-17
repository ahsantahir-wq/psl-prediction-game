require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// PSL Team Logo Mapping
const TEAM_LOGOS = {
  'Islamabad United': 'https://wmuibafrpidgwaidekrj.supabase.co/storage/v1/object/public/team-logos/islamabad-united.png',
  'Karachi Kings': 'https://wmuibafrpidgwaidekrj.supabase.co/storage/v1/object/public/team-logos/karachi-kings.png',
  'Lahore Qalandars': 'https://wmuibafrpidgwaidekrj.supabase.co/storage/v1/object/public/team-logos/lahore-qalandars.png',
  'Multan Sultans': 'https://wmuibafrpidgwaidekrj.supabase.co/storage/v1/object/public/team-logos/multan-sultans.png',
  'Peshawar Zalmi': 'https://wmuibafrpidgwaidekrj.supabase.co/storage/v1/object/public/team-logos/peshawar-zalmi.png',
  'Quetta Gladiators': 'https://wmuibafrpidgwaidekrj.supabase.co/storage/v1/object/public/team-logos/quetta-gladiators.png'
};

async function importPSLData(jsonFolderPath) {
  console.log('🏏 Starting PSL Data Import...\n');

  // Get all JSON files
  const files = fs.readdirSync(jsonFolderPath).filter(f => f.endsWith('.json'));
  console.log(`📂 Found ${files.length} match files\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const file of files) {
    try {
      const filePath = path.join(jsonFolderPath, file);
      const rawData = fs.readFileSync(filePath, 'utf8');
      const matchData = JSON.parse(rawData);

      // Extract match info
      const info = matchData.info;
      const innings = matchData.innings;

      // Skip if not PSL match
      if (!info.event || info.event.name !== 'Pakistan Super League') {
        console.log(`⏭️  Skipping non-PSL match: ${file}`);
        continue;
      }

      // Calculate scores and wickets
      const innings1 = innings[0];
      const innings2 = innings[1] || null;

      const score1 = calculateInningsScore(innings1);
      const score2 = innings2 ? calculateInningsScore(innings2) : { runs: 0, wickets: 0 };

      // Determine batting team (team that batted first)
      const battingFirstTeam = innings1.team;
      const battingSecondTeam = innings2 ? innings2.team : null;

      // Get team names (maintain order)
      const teamA = info.teams[0];
      const teamB = info.teams[1];

      // Assign scores based on which team batted first
      let scoreA, wicketsA, scoreB, wicketsB;
      if (battingFirstTeam === teamA) {
        scoreA = score1.runs;
        wicketsA = score1.wickets;
        scoreB = score2.runs;
        wicketsB = score2.wickets;
      } else {
        scoreA = score2.runs;
        wicketsA = score2.wickets;
        scoreB = score1.runs;
        wicketsB = score1.wickets;
      }

      // Build ball history (last 12 balls)
      const ballHistory = buildBallHistory(innings);

      // Calculate total balls
      const totalBalls = calculateTotalBalls(innings);
      const lastOver = Math.floor(totalBalls / 6);

      // Prepare match data for database
      const matchRecord = {
        team_a: teamA,
        team_b: teamB,
        venue: info.venue || 'Unknown',
        match_date: info.dates[0] + 'T19:00:00Z',
        status: 'completed',
        current_over: lastOver,
        current_score_a: scoreA,
        current_score_b: scoreB,
        current_wickets_a: wicketsA,
        current_wickets_b: wicketsB,
        batting_team: battingSecondTeam || teamA,
        ball_number: totalBalls,
        last_ball_runs: ballHistory.length > 0 ? ballHistory[ballHistory.length - 1].runs : 0,
        last_ball_event: ballHistory.length > 0 ? ballHistory[ballHistory.length - 1].event : null,
        ball_history: ballHistory,
        innings: innings2 ? 2 : 1,
        team_a_logo: TEAM_LOGOS[teamA] || null,
        team_b_logo: TEAM_LOGOS[teamB] || null
      };

      // Insert into database
      const { data, error } = await supabase
        .from('matches')
        .insert(matchRecord)
        .select();

      if (error) {
        console.error(`❌ Error importing ${file}:`, error.message);
        errorCount++;
      } else {
        console.log(`✅ Imported: ${teamA} vs ${teamB} (${info.dates[0]})`);
        successCount++;
      }

    } catch (err) {
      console.error(`❌ Failed to process ${file}:`, err.message);
      errorCount++;
    }
  }

  console.log('\n📊 Import Summary:');
  console.log(`✅ Success: ${successCount}`);
  console.log(`❌ Failed: ${errorCount}`);
  console.log(`📈 Total: ${successCount + errorCount}`);
}

// Helper: Calculate innings score
function calculateInningsScore(innings) {
  let runs = 0;
  let wickets = 0;

  for (const over of innings.overs) {
    for (const delivery of over.deliveries) {
      runs += delivery.runs.total;
      if (delivery.wickets && delivery.wickets.length > 0) {
        wickets += delivery.wickets.length;
      }
    }
  }

  return { runs, wickets };
}

// Helper: Calculate total balls
function calculateTotalBalls(innings) {
  let balls = 0;
  for (const inning of innings) {
    for (const over of inning.overs) {
      balls += over.deliveries.length;
    }
  }
  return balls;
}

// Helper: Build ball history (last 12 balls)
function buildBallHistory(innings) {
  const allBalls = [];

  for (const inning of innings) {
    for (const over of inning.overs) {
      for (let i = 0; i < over.deliveries.length; i++) {
        const delivery = over.deliveries[i];
        const isWicket = delivery.wickets && delivery.wickets.length > 0;
        const runs = delivery.runs.batter;

        let event = '';
        if (isWicket) event = '🔴 Wicket!';
        else if (runs === 6) event = '⭐ Six!';
        else if (runs === 4) event = '🎯 Four!';
        else if (runs === 0) event = '⚪ Dot Ball';
        else event = `${runs} Run${runs > 1 ? 's' : ''}`;

        allBalls.push({
          ball: allBalls.length + 1,
          runs: runs,
          isWicket: isWicket,
          event: event,
          over: over.over,
          ballInOver: i
        });
      }
    }
  }

  // Return last 12 balls
  return allBalls.slice(-12);
}

// Main execution
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('❌ Usage: node import-psl-data.js <path-to-json-folder>');
  process.exit(1);
}

const jsonFolder = args[0];
if (!fs.existsSync(jsonFolder)) {
  console.error(`❌ Folder not found: ${jsonFolder}`);
  process.exit(1);
}

importPSLData(jsonFolder)
  .then(() => {
    console.log('\n🎉 Import complete!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n💥 Import failed:', err);
    process.exit(1);
  });
