const { PrismaClient } = require('./lib/generated/prisma');
const prisma = new PrismaClient();

async function check() {
    try {
        const users = await prisma.user.findMany({
            include: { role: true }
        });
        console.log("USERS:", JSON.stringify(users.map(u => ({ id: u.id, name: u.name, role: u.role.name })), null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

check();
