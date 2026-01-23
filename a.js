const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// Hardcode for debugging
const DB_URL = "mysql://root:@localhost:3306/oficina_opt";
console.log('Using hardcoded URL:', DB_URL);

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
    // Trigger connection
    await prisma.$connect();
    console.log('Connected!');

    console.log('Checking for ADMIN role...');
    let adminRole = await prisma.role.findUnique({
        where: { name: 'ADMIN' }
    });

    if (!adminRole) {
        console.log('Creating ADMIN role...');
        adminRole = await prisma.role.create({
            data: {
                name: 'ADMIN',
                description: 'Administrator with full access'
            }
        });
    }

    console.log('Upserting user...');
    const user = await prisma.user.upsert({
        where: { email },
        update: {
            passwordHash: hashedPassword,
            roleId: adminRole.id,
            active: true,
            name: 'Ricardo Luz',
            active: true
        },
        create: {
            email,
            name: 'Ricardo Luz',
            passwordHash: hashedPassword,
            roleId: adminRole.id,
            active: true
        }
    });

    console.log(`SUCCESS: User ${user.email} created with ID: ${user.id}`);
}

main()
    .catch(e => {
        console.error('FATAL ERROR:', e);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
