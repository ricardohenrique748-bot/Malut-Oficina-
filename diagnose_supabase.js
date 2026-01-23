require('dotenv').config();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log("Checking Supabase Environment Variables...");

if (!url) {
    console.error("ERROR: NEXT_PUBLIC_SUPABASE_URL is missing!");
} else {
    console.log("NEXT_PUBLIC_SUPABASE_URL is set.");
    console.log("URL Format:", url.startsWith('http') ? 'Valid Protocol' : 'Invalid Protocol');
    
    // Check connectivity
    console.log("Testing connectivity to Supabase URL...");
    fetch(url, { headers: { 'apikey': key } })
        .then(res => {
            console.log("Connectivity Check: Success");
            console.log("Status:", res.status);
        })
        .catch(err => {
            console.error("Connectivity Check: FAILED");
            console.error("Error:", err.message);
            if (err.cause) console.error("Cause:", err.cause);
        });
}

if (!key) {
    console.error("ERROR: NEXT_PUBLIC_SUPABASE_ANON_KEY is missing!");
} else {
    console.log("NEXT_PUBLIC_SUPABASE_ANON_KEY is set.");
}
