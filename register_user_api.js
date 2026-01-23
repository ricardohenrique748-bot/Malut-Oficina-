const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(url, key);

async function register() {
    console.log("Tentando cadastrar usuário via API...");
    const { data, error } = await supabase.auth.signUp({
        email: 'ricardo.luz@eunaman.com.br',
        password: 'malut2026',
        options: {
            data: {
                role: 'ADMIN',
                name: 'Ricardo Luz'
            }
        }
    });

    if (error) {
        console.error("Erro no cadastro:", error.message);
    } else {
        console.log("Usuário cadastrado com sucesso!");
        console.log("ID do Usuário:", data.user.id);
    }
}

register();
