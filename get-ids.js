const { PrismaClient } = require('./lib/generated/prisma');
const prisma = new PrismaClient();

async function check() {
    try {
        const customer = await prisma.customer.findFirst({ include: { vehicles: true } });
        const user = await prisma.user.findFirst();
        console.log("CUSTOMER:", customer.id);
        console.log("VEHICLE:", customer.vehicles[0]?.id);
        console.log("USER:", user.id);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

check();
