const dotenv = require('dotenv');
dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;

async function test(model) {
    try {
        const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}?key=${API_KEY}`);
        const data = await resp.json();
        if (resp.status === 200) {
            console.log(`FOUND: ${model}`);
            // Test if it has quota
            const tResp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: 'test' }] }] })
            });
            if (tResp.status === 200) {
                console.log(`   ✅ HAS QUOTA: ${model}`);
            } else {
                const tData = await tResp.json();
                console.log(`   ❌ NO QUOTA: ${model} (${tResp.status} - ${tData.error?.message})`);
            }
        }
    } catch (e) { }
}

async function run() {
    // List models first
    const lResp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
    const lData = await lResp.json();
    if (lData.models) {
        for (const m of lData.models) {
            await test(m.name.split('/')[1]);
        }
    }
}
run();
