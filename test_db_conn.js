const { Client } = require('pg');

const connectionString = "postgresql://postgres:MalutOficina2026!@db.xhfukexobxdgwknrlbzt.supabase.co:5432/postgres";

async function test() {
    const client = new Client({ connectionString });
    try {
        console.log("Connecting...");
        await client.connect();
        console.log("Connected successfully!");
        const res = await client.query('SELECT NOW()');
        console.log("Query result:", res.rows[0]);
        await client.end();
    } catch (err) {
        console.error("Connection error:", err.message);
    }
}

test();
