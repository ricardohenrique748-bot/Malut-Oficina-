const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
    try {
        const users = await prisma.$queryRaw`SELECT id, encrypted_password FROM auth.users WHERE email = 'ricardo.luz@eunaman.com.br'`;
        console.log("Auth Users:", users.length ? "Found" : "Not Found");
        if (users.length) {
            console.log("- User ID:", users[0].id);
        }
    } catch (e) {
        console.log("Error querying auth.users:", e.message);
    }

    try {
        const publicUsers = await prisma.$queryRaw`SELECT id, name, email FROM users WHERE email = 'ricardo.luz@eunaman.com.br'`;
        console.log("Public Users:", publicUsers.length ? "Found" : "Not Found");
        if (publicUsers.length) {
            console.log("- User ID:", publicUsers[0].id);
            console.log("- Name:", publicUsers[0].name);
        }
    } catch (e) {
        console.log("Error querying users:", e.message);
    }

    await prisma.$disconnect();
}

run().catch(console.error);
