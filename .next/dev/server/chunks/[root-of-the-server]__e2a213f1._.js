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
"[project]/app/api/simulate/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/supabase-js/dist/index.mjs [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
;
;
const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(("TURBOPACK compile-time value", "https://wmuibafrpidgwaidekrj.supabase.co"), process.env.SUPABASE_SERVICE_ROLE_KEY);
async function GET() {
    try {
        // 1. Get live matches
        const { data: matches } = await supabase.from('matches').select('*').eq('status', 'live').lt('ball_number', 120);
        if (!matches || matches.length === 0) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                message: 'No live matches found'
            });
        }
        console.log('Found live matches:', matches.length);
        for (const match of matches){
            // 2. Simulate next ball with better odds for testing
            const outcomes = [
                0,
                0,
                1,
                2,
                4,
                6,
                'W',
                4,
                6
            ] // More boundaries for testing
            ;
            const runs = outcomes[Math.floor(Math.random() * outcomes.length)];
            const isWicket = runs === 'W';
            const ballRuns = isWicket ? 0 : runs;
            const nextBall = match.ball_number + 1;
            const nextScore = match.current_score_a + ballRuns;
            const nextWickets = match.current_wickets_a + (isWicket ? 1 : 0);
            let ballEvent = '';
            if (isWicket) ballEvent = '🔴 Wicket!';
            else if (ballRuns === 6) ballEvent = '⭐ Six!';
            else if (ballRuns === 4) ballEvent = '🎯 Four!';
            else if (ballRuns === 0) ballEvent = '⚪ Dot Ball';
            else ballEvent = `${ballRuns} Run${ballRuns > 1 ? 's' : ''}`;
            console.log(`Ball ${nextBall}: ${ballEvent}`);
            // 3. Update match
            await supabase.from('matches').update({
                ball_number: nextBall,
                current_score_a: nextScore,
                current_wickets_a: nextWickets,
                last_ball_runs: ballRuns,
                last_ball_event: ballEvent,
                status: nextBall >= 120 || nextWickets >= 10 ? 'completed' : 'live'
            }).eq('id', match.id);
            // 4. Resolve predictions for this ball
            const { data: predictions } = await supabase.from('predictions').select('*').eq('match_id', match.id).eq('status', 'pending');
            console.log(`Checking ${predictions?.length || 0} predictions...`);
            if (predictions && predictions.length > 0) {
                for (const pred of predictions){
                    let isWinner = false;
                    console.log(`Prediction: ${pred.action_type} = ${pred.predicted_outcome}`);
                    // Match action_type and predicted_outcome with ball event
                    if (pred.action_type === 'over_outcome') {
                        if (pred.predicted_outcome === '0-6' && ballRuns <= 6) isWinner = true;
                        if (pred.predicted_outcome === '7-12' && ballRuns >= 7 && ballRuns <= 12) isWinner = true;
                        if (pred.predicted_outcome === '13+' && ballRuns >= 13) isWinner = true;
                    }
                    if (pred.action_type === 'boundary_rush') {
                        if (pred.predicted_outcome === 'yes' && (ballRuns === 4 || ballRuns === 6)) {
                            isWinner = true;
                        }
                        if (pred.predicted_outcome === 'no' && ballRuns !== 4 && ballRuns !== 6 && !isWicket) {
                            isWinner = true;
                        }
                    }
                    if (pred.action_type === 'wicket_window') {
                        if (pred.predicted_outcome === 'yes' && isWicket) {
                            isWinner = true;
                        }
                        if (pred.predicted_outcome === 'no' && !isWicket) {
                            isWinner = true;
                        }
                    }
                    if (isWinner) {
                        console.log(`✅ WINNER! User ${pred.user_id} won ${pred.potential_payout} credits`);
                        // Mark prediction as won
                        await supabase.from('predictions').update({
                            status: 'won',
                            resolved_at: new Date().toISOString()
                        }).eq('id', pred.id);
                        // Update wallet
                        const { data: wallet } = await supabase.from('wallet').select('balance').eq('user_id', pred.user_id).single();
                        if (wallet) {
                            await supabase.from('wallet').update({
                                balance: wallet.balance + pred.potential_payout
                            }).eq('user_id', pred.user_id);
                        }
                        // Update user stats
                        await supabase.rpc('increment_stats', {
                            p_user_id: pred.user_id,
                            p_win: true
                        });
                    } else {
                        // Mark as lost after ball is played
                        console.log(`❌ Lost prediction for user ${pred.user_id}`);
                        await supabase.from('predictions').update({
                            status: 'lost',
                            resolved_at: new Date().toISOString()
                        }).eq('id', pred.id);
                        // Update user stats
                        await supabase.rpc('increment_stats', {
                            p_user_id: pred.user_id,
                            p_win: false
                        });
                    }
                }
            }
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            message: 'Simulation complete'
        });
    } catch (error) {
        console.error('Simulation error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Simulation failed'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__e2a213f1._.js.map