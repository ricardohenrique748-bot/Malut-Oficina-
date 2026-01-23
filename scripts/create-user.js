const { PrismaClient } = require('../lib/generated/prisma');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createRicardoUser() {
    console.log('Seeding roles and creating user Ricardo...');

    const roles = ['ADMIN', 'RECEPCAO', 'MECANICO', 'FINANCEIRO', 'GERENTE'];
    for (const roleName of roles) {
        await prisma.role.upsert({
            where: { name: roleName },
            update: {},
            create: { name: roleName }
        });
    }

    const email = 'ricardo.luz@eunaman.com.br';
    const password = '15975321';

    // 1. Get ADMIN Role
    const adminRole = await prisma.role.findUnique({
        where: { name: 'ADMIN' }
    });

    if (!adminRole) {
        console.error('Role ADMIN not found. Please run seed first.');
        return;
    }

    // 2. Hash Password
    const passwordHash = await bcrypt.hash(password, 10);

    // 3. Upsert User
    const user = await prisma.user.upsert({
        where: { email },
        update: {
            name: 'Ricardo Luz',
            passwordHash,
            roleId: adminRole.id,
            active: true
        },
        create: {
            name: 'Ricardo Luz',
            email,
            passwordHash,
            roleId: adminRole.id,
            active: true
        }
    });

    console.log(`User created/updated: ${user.email} with ADMIN role.`);
}

createRicardoUser()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
