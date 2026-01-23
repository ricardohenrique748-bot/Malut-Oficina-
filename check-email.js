const { PrismaClient } = require('./lib/generated/prisma');
const prisma = new PrismaClient();

async function check() {
    try {
        const email = "ricardo.luz@eunaman.com.br";
        const existing = await prisma.user.findUnique({ where: { email } });
        console.log("Existing user with email:", existing ? existing.id : "NONE");
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

check();
