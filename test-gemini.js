const https = require('https');
const fs = require('fs');
const path = require('path');

// Simple .env parser
try {
    const envPath = path.resolve(__dirname, '.env');
    const envFile = fs.readFileSync(envPath, 'utf8');
    const match = envFile.match(/GEMINI_API_KEY=(.*)/);
    if (match && match[1]) {
        process.env.GEMINI_API_KEY = match[1].trim();
    }
} catch (e) {
    console.log("Could not read .env file");
}

const API_KEY = process.env.GEMINI_API_KEY;
console.log(`Checking Key: ${API_KEY ? API_KEY.substring(0, 5) + '...' : 'UNKNOWN'}`);

const options = {
    hostname: 'generativelanguage.googleapis.com',
    path: `/v1beta/models?key=${API_KEY}`,
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
};

const req = https.request(options, (res) => {
    let body = '';
    res.on('data', (d) => body += d);
    res.on('end', () => {
        console.log(`\nResponse Status: ${res.statusCode}`);
        try {
            const data = JSON.parse(body);
            if (data.models) {
                const valid = data.models
                    .filter(m => m.supportedGenerationMethods.includes('generateContent'))
                    .map(m => m.name.replace('models/', ''));

                fs.writeFileSync('models.json', JSON.stringify(valid, null, 2));
                console.log("SUCCESS: Wrote models to models.json");
            } else {
                console.log("Error Response:", JSON.stringify(data, null, 2));
            }
        } catch (e) {
            console.log("Raw Body:", body);
        }
    });
});
req.on('error', (e) => console.error(e));
req.end();
