require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function checkLogin() {
    const email = 'ricardo.luz@eunaman.com.br';
    const password = '15975321';

    console.log(`Checking login for: ${email}`);

    const user = await prisma.user.findUnique({
        where: { email },
        include: { role: true }
    });

    if (!user) {
        console.error("User NOT FOUND in database!");
        return;
    }

    console.log(`User found: ${user.name}`);
    console.log(`Stored Hash: ${user.passwordHash}`);

    const match = await bcrypt.compare(password, user.passwordHash);
    if (match) {
        console.log("SUCCESS: Password matches the hash!");
    } else {
        console.error("FAILURE: Password does NOT match.");
        const newHash = await bcrypt.hash(password, 10);
        console.log(`Debug - A fresh hash for '${password}' would be: ${newHash}`);
    }
}

checkLogin()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
