const { PrismaClient } = require('./lib/generated/prisma');
const bcrypt = require('bcryptjs');
const { randomUUID } = require('crypto');
const prisma = new PrismaClient();

async function test() {
    try {
        const roles = await prisma.role.findMany();
        console.log("Available roles:", roles.map(r => ({ id: r.id, name: r.name })));

        const adminRole = roles.find(r => r.name === 'ADMIN');
        if (!adminRole) {
            console.log("ERROR: No ADMIN role found!");
            return;
        }

        const passwordHash = await bcrypt.hash("123456", 10);
        const newId = randomUUID();

        console.log("Attempting to create user with ID:", newId);

        const user = await prisma.user.create({
            data: {
                id: newId,
                name: "Test User",
                email: "test" + Date.now() + "@test.com",
                passwordHash,
                roleId: adminRole.id,
                commissionRate: 5,
                active: true
            }
        });

        console.log("SUCCESS! Created user:", user.id);
    } catch (e) {
        console.error("FAILED:");
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

test();
