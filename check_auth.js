const { Client } = require('pg');
require('dotenv').config();

const client = new Client({ connectionString: process.env.DATABASE_URL });

async function run() {
    await client.connect();

    try {
        const resAuth = await client.query("SELECT * FROM auth.users WHERE email = 'ricardo.luz@eunaman.com.br'");
        console.log("Auth Users:", resAuth.rows.length ? "Found" : "Not Found");
        if (resAuth.rows.length) {
            console.log("- User ID:", resAuth.rows[0].id);
            console.log("- Encrypted password:", resAuth.rows[0].encrypted_password);
        }
    } catch (err) {
        console.log("Error querying auth.users:", err.message);
    }

    try {
        const resPublic = await client.query("SELECT id, name, email FROM users WHERE email = 'ricardo.luz@eunaman.com.br'");
        console.log("Public Users:", resPublic.rows.length ? "Found" : "Not Found");
        if (resPublic.rows.length) {
            console.log("- User ID:", resPublic.rows[0].id);
            console.log("- Name:", resPublic.rows[0].name);
        }
    } catch (err) {
        console.log("Error querying public.users:", err.message);
    }

    await client.end();
}

run().catch(console.error);
