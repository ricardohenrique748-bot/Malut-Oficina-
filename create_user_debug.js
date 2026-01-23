require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

console.log('DEBUG: Loaded DATABASE_URL:', process.env.DATABASE_URL);

// Explicitly pass the URL to the constructor to avoid any ambiguity
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL,
        },
    },
});

async function main() {
    const email = 'ricardo.luz@eunaman.com.br';
    const password = '15975321';

    console.log(`DEBUG: Hashing password for ${email}...`);
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('DEBUG: Password hashed.');

    console.log('DEBUG: Checking for ADMIN role...');
    let adminRole = await prisma.role.findUnique({
        where: { name: 'ADMIN' }
    });

    if (!adminRole) {
        console.log('DEBUG: Creating ADMIN role...');
        adminRole = await prisma.role.create({
            data: {
                name: 'ADMIN',
                description: 'Administrator with full access'
            }
        });
    }

    console.log('DEBUG: Upserting user...');
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

    console.log(`SUCCESS: User ${user.email} created/updated with ID: ${user.id}`);
}

main()
    .catch(e => {
        console.error('ERROR:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
