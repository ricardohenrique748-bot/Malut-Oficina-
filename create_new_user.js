const { createClient } = require('@supabase/supabase-js');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const prisma = new PrismaClient();

async function create() {
    const { data, error } = await sb.auth.signUp({
        email: 'ricardo.luz@eunaman.com.br',
        password: 'malut123'
    });

    if (error && error.message.includes('already registered')) {
        console.log("Supabase Auth user already exists. OK.");
    } else if (error) {
        console.error("SignUp Error:", error);
    } else {
        console.log("Supabase Auth user created!", data.user?.id);
    }
}

create().then(() => prisma.$disconnect());
