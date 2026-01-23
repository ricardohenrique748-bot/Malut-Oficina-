const { Client } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;

async function test() {
    console.log("Testing connection to:", connectionString.replace(/:[^:@]+@/, ':****@'));
    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });
    try {
        await client.connect();
        console.log("SUCCESS: Connected to database via Pooler!");
        const res = await client.query('SELECT NOW()');
        console.log("Time from DB:", res.rows[0].now);
        await client.end();
    } catch (err) {
        console.error("FAILED to connect:", err.message);
        if (err.detail) console.error("Detail:", err.detail);
    }
}

test();
