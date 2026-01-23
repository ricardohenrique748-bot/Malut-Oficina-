const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database...');

    // 1. Roles
    const roles = [
        { name: 'ADMIN', description: 'Access everything' },
        { name: 'RECEPCAO', description: 'Front desk, customers, OS' },
        { name: 'MECANICO', description: 'Execution, Diagnostics' },
        { name: 'FINANCEIRO', description: 'Financial records' },
        { name: 'GERENTE', description: 'Management and Approvals' },
        { name: 'VENDEDOR', description: 'Sales and CRM' },
    ];

    for (const role of roles) {
        await prisma.role.upsert({
            where: { name: role.name },
            update: {},
            create: role,
        });
    }

    // 2. Users
    const passwordHash = await bcrypt.hash('123456', 10);

    const users = [
        { name: 'Admin User', email: 'admin@oficina.com', role: 'ADMIN' },
        { name: 'Maria Recepcao', email: 'recepcao@oficina.com', role: 'RECEPCAO' },
        { name: 'Joao Mecanico', email: 'mecanico@oficina.com', role: 'MECANICO' },
    ];

    for (const u of users) {
        const role = await prisma.role.findUnique({ where: { name: u.role } });
        if (role) {
            await prisma.user.upsert({
                where: { email: u.email },
                update: {},
                create: {
                    name: u.name,
                    email: u.email,
                    passwordHash,
                    roleId: role.id,
                },
            });
        }
    }

    console.log('Users seeded.');

    // 3. Customers & Vehicles
    const customerUser = await prisma.user.findUnique({ where: { email: 'recepcao@oficina.com' } });

    if (!customerUser) return; // Should exist

    const createdCustomers = [];
    for (let i = 1; i <= 3; i++) {
        const customer = await prisma.customer.create({
            data: {
                name: `Cliente Teste ${i}`,
                document: `000.000.00${i}-00`,
                phone: '11999999999',
                vehicles: {
                    create: {
                        plate: `ABC-123${i}`,
                        brand: 'VW',
                        model: 'Gol',
                        year: 2020 + i,
                        color: 'Branco',
                    },
                },
            },
            include: { vehicles: true },
        });
        createdCustomers.push(customer);
    }

    console.log('Customers seeded.');

    // 4. Work Orders (OS)
    const mecanicoUser = await prisma.user.findUnique({ where: { email: 'mecanico@oficina.com' } });

    // Status flow for demo
    const statuses = ['ABERTA', 'ORCAMENTO', 'EM_EXECUCAO'];

    for (let i = 0; i < 3; i++) {
        const customer = createdCustomers[i];
        const vehicle = customer.vehicles[0];
        const status = statuses[i];

        await prisma.workOrder.create({
            data: {
                customerId: customer.id,
                vehicleId: vehicle.id,
                status: status as any,
                createdById: customerUser.id,
                responsibleId: status === 'EM_EXECUCAO' ? mecanicoUser?.id : null,
                notes: `OS de teste ${i + 1}`,
                statusHistory: {
                    create: {
                        newStatus: status as any,
                        changedById: customerUser.id,
                        notes: 'Initial Status',
                    },
                },
            },
        });
    }

    console.log('WorkOrders seeded.');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
