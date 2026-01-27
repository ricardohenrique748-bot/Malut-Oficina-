const { Client } = require('pg');

const connectionString = "postgresql://postgres.xhfukexobxdgwknrlbzt:Synyster852@aws-0-sa-east-1.pooler.supabase.com:6543/postgres";

async function testConnection() {
    const client = new Client({
        connectionString: connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log("Trying to connect...");
        await client.connect();
        console.log("Connected successfully!");
        const res = await client.query('SELECT NOW()');
        console.log("Query result:", res.rows[0]);
        await client.end();
    } catch (err) {
        console.error("Connection error details:", err);
    }
}

testConnection();
