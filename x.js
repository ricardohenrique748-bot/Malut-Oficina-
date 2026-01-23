const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const DB_URL = "mysql://root:@localhost:3306/oficina_opt";

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: DB_URL,
        },
    },
});

async function main() {
    const email = 'ricardo.luz@eunaman.com.br';
    const password = '15975321';

    console.log(`Hashing password...`);
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log('Connecting to DB...');
    await prisma.$connect();
    console.log('Connected!');

    console.log('Check/Create ADMIN role...');
    let adminRole = await prisma.role.findUnique({ where: { name: 'ADMIN' } });
    if (!adminRole) {
        adminRole = await prisma.role.create({
            data: { name: 'ADMIN', description: 'Administrator' }
        });
    }

    console.log('Upserting user...');
    const user = await prisma.user.upsert({
        where: { email },
        update: {
            passwordHash: hashedPassword,
            roleId: adminRole.id,
            active: true,
            name: 'Ricardo Luz'
        },
        create: {
            email,
            name: 'Ricardo Luz',
            passwordHash: hashedPassword,
            roleId: adminRole.id,
            active: true
        }
    });

    console.log(`DONE: User ${user.email} ID: ${user.id}`);
}

main()
    .catch(e => { console.error(e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
