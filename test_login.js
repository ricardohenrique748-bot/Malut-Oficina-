
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://kdxwjweqbsgxgtgxtkgi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkeHdqd2VxYnNneGd0Z3h0a2dpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3MDMxNDYsImV4cCI6MjA4NTI3OTE0Nn0.uJRRFwCb7alTJmmfTF6mKzZdv1aBqQ-3cQVGmvS6zjY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testLogin() {
    console.log("Tentando login...");
    const { data, error } = await supabase.auth.signInWithPassword({
        email: 'ricardo.luz@eunaman.com.br',
        password: 'malut123'
    });

    if (error) {
        console.error("Erro no login:", error);
    } else {
        console.log("Login SUCESSO! Token:", data.session.access_token.substring(0, 20) + "...");
    }
}

testLogin();
