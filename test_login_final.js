
const { createClient } = require('@supabase/supabase-js');

// Hardcoded credentials matched to Step 114/117
const supabaseUrl = 'https://kdxwjweqbsgxgtgxtkgi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkeHdqd2VxYnNneGd0Z3h0a2dpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3MDMxNDYsImV4cCI6MjA4NTI3OTE0Nn0.uJRRFwCb7alTJmmfTF6mKzZdv1aBqQ-3cQVGmvS6zjY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function validadeLoginFinal() {
    console.log("=== TESTE FINAL LOGIN ===");
    console.log("Email: ricardo.luz@eunaman.com.br");
    console.log("Senha: 123456");

    // Force sign out just in case
    await supabase.auth.signOut();

    const { data, error } = await supabase.auth.signInWithPassword({
        email: 'ricardo.luz@eunaman.com.br',
        password: '123456'
    });

    if (error) {
        console.error("❌ FALHA NO LOGIN:", error.message);
        process.exit(1);
    } else {
        console.log("✅ LOGIN COM SUCESSO!");
        console.log("User ID:", data.user.id);
        console.log("Email:", data.user.email);
        process.exit(0);
    }
}

validadeLoginFinal();
