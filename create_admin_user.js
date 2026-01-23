require('dotenv').config(); // Load .env file explicitly
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('Starting user creation...');
    console.log('Database URL:', process.env.DATABASE_URL); // Debugging

    const email = 'ricardo.luz@eunaman.com.br';
    const password = '15975321';

    // Check if user exists first to decide if we need to hash
    // (Optimization: but upsert handles it. We just hash anyway)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Ensure Role ADMIN exists
    // We try to find it first.
    let adminRole = await prisma.role.findUnique({
        where: { name: 'ADMIN' }
    });

    if (!adminRole) {
        console.log('Creating ADMIN role...');
        // If it doesn't exist, create it.
        // Note: If schema changed, ensure 'name' is still unique and required.
        adminRole = await prisma.role.create({
            data: {
                name: 'ADMIN',
                description: 'Administrator with full access'
            }
        });
    }

    // Create/Update User
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

    console.log(`User ${user.email} created/updated with ID: ${user.id}`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
