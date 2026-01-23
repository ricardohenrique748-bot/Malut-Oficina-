const dotenv = require('dotenv');
dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;

async function testModel(modelName) {
    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: "Hello" }] }],
                }),
            }
        );

        const status = response.status;
        const data = await response.json();

        if (status === 200) {
            return { model: modelName, success: true };
        } else {
            return { model: modelName, success: false, status, message: data.error?.message };
        }
    } catch (e) {
        return { model: modelName, success: false, error: e.message };
    }
}

async function runTests() {
    const models = [
        "gemini-1.5-flash-8b",
        "gemini-1.5-flash",
        "gemini-1.5-flash-001",
        "gemini-1.5-flash-002",
        "gemini-1.5-pro",
        "gemini-1.5-pro-001",
        "gemini-1.5-pro-002",
        "gemini-flash-latest"
    ];

    console.log("WORKING MODELS:");
    for (const m of models) {
        const res = await testModel(m);
        if (res.success) {
            console.log(`✅ ${m}`);
        } else {
            console.log(`❌ ${m}: ${res.status || 'ERROR'} - ${res.message || res.error}`);
        }
    }
}

runTests();
