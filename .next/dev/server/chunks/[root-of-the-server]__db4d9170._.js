module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/app/lib/matchSimulator.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "simulateBall",
    ()=>simulateBall
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/supabase-js/dist/index.mjs [app-route] (ecmascript) <locals>");
;
const supabaseUrl = ("TURBOPACK compile-time value", "https://wmuibafrpidgwaidekrj.supabase.co");
const supabaseKey = ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtdWliYWZycGlkZ3dhaWRla3JqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1NzAzMjEsImV4cCI6MjA4NDE0NjMyMX0.xQ1HvIQnjtf8AeVTWv4J5LbRZC1U8hs5MIBfTSLLDkc");
const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(supabaseUrl, supabaseKey);
// Weighted outcomes for realistic cricket
const WEIGHTED_OUTCOMES = [
    ...Array(30).fill({
        runs: 0,
        isWicket: false,
        isBoundary: false,
        event: 'Dot ball'
    }),
    ...Array(20).fill({
        runs: 1,
        isWicket: false,
        isBoundary: false,
        event: 'Single'
    }),
    ...Array(10).fill({
        runs: 2,
        isWicket: false,
        isBoundary: false,
        event: 'Two runs'
    }),
    ...Array(8).fill({
        runs: 4,
        isWicket: false,
        isBoundary: true,
        event: 'FOUR! 🎯'
    }),
    ...Array(3).fill({
        runs: 6,
        isWicket: false,
        isBoundary: true,
        event: 'SIX! 🚀'
    }),
    ...Array(4).fill({
        runs: 0,
        isWicket: true,
        isBoundary: false,
        event: 'WICKET! 🔥'
    }),
    ...Array(15).fill({
        runs: 1,
        isWicket: false,
        isBoundary: false,
        event: 'Quick single'
    })
];
function getRandomBall() {
    return WEIGHTED_OUTCOMES[Math.floor(Math.random() * WEIGHTED_OUTCOMES.length)];
}
async function simulateBall(matchId) {
    // Get current match state
    const { data: match1 } = await supabase.from('matches').select('*').eq('id', matchId).eq('status', 'live').single();
    if (!match1) return null;
    const ball = getRandomBall();
    const newBallNumber = (match1.ball_number || 0) + 1;
    const newOver = Math.floor(newBallNumber / 6);
    const newScore = (match1.current_score_a || 0) + ball.runs;
    const newWickets = (match1.current_wickets_a || 0) + (ball.isWicket ? 1 : 0);
    // Update match
    await supabase.from('matches').update({
        current_over: newOver,
        current_score_a: newScore,
        current_wickets_a: newWickets,
        ball_number: newBallNumber,
        last_ball_runs: ball.runs,
        last_ball_event: ball.event
    }).eq('id', matchId);
    // Resolve predictions for this ball
    await resolvePredictions(matchId, match1.current_over || 0, ball);
    // End match after 20 overs or 10 wickets
    if (newOver >= 20 || newWickets >= 10) {
        await supabase.from('matches').update({
            status: 'completed'
        }).eq('id', matchId);
    }
    return {
        match: match1,
        ball,
        newOver,
        newScore,
        newWickets
    };
}
async function resolvePredictions(matchId, currentOver, ball) {
    // Get pending predictions for this match
    const { data: predictions } = await supabase.from('predictions').select('*').eq('match_id', matchId).eq('status', 'pending');
    if (!predictions || predictions.length === 0) return;
    for (const prediction of predictions){
        let won = false;
        let shouldResolve = false;
        switch(prediction.action_type){
            case 'boundary_rush':
                // Resolve immediately
                shouldResolve = true;
                if (prediction.prediction_data?.option === 'yes' && ball.isBoundary) {
                    won = true;
                } else if (prediction.prediction_data?.option === 'no' && !ball.isBoundary) {
                    won = true;
                }
                break;
            case 'wicket_window':
                // Resolve if wicket falls
                if (ball.isWicket && prediction.prediction_data?.option === 'yes') {
                    won = true;
                    shouldResolve = true;
                }
                // Resolve after 6 balls if no wicket
                const ballsSincePrediction = (match.ball_number || 0) - (prediction.prediction_data?.ball_number || 0);
                if (ballsSincePrediction >= 6) {
                    shouldResolve = true;
                    won = false;
                }
                break;
            case 'over_outcome':
                // Resolve at end of over
                if ((match.ball_number || 0) % 6 === 0) {
                    shouldResolve = true;
                    const overRuns = ball.runs // Simplified - would need to track full over
                    ;
                    if (prediction.prediction_data?.option === 'high' && overRuns >= 8) {
                        won = true;
                    } else if (prediction.prediction_data?.option === 'medium' && overRuns >= 4 && overRuns < 8) {
                        won = true;
                    } else if (prediction.prediction_data?.option === 'low' && overRuns < 4) {
                        won = true;
                    }
                }
                break;
        }
        if (shouldResolve) {
            await supabase.from('predictions').update({
                status: won ? 'won' : 'lost',
                credits_won: won ? prediction.potential_win : 0,
                resolved_at: new Date().toISOString()
            }).eq('id', prediction.id);
            if (won) {
                // Award credits
                const { data: wallet } = await supabase.from('wallet').select('credits_balance').eq('user_id', prediction.user_id).single();
                if (wallet) {
                    await supabase.from('wallet').update({
                        credits_balance: wallet.credits_balance + prediction.potential_win
                    }).eq('user_id', prediction.user_id);
                    // Update stats
                    const { data: stats } = await supabase.from('user_stats').select('*').eq('user_id', prediction.user_id).single();
                    if (stats) {
                        await supabase.from('user_stats').update({
                            correct_predictions: stats.correct_predictions + 1,
                            credits_won: stats.credits_won + prediction.potential_win
                        }).eq('user_id', prediction.user_id);
                    }
                }
            }
        }
    }
}
}),
"[project]/app/api/simulate/route.ts [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

const e = new Error("Could not parse module '[project]/app/api/simulate/route.ts'\n\nExpected '}', got '<eof>'");
e.code = 'MODULE_UNPARSABLE';
throw e;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__db4d9170._.js.map