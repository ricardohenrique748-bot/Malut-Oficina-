const { PrismaClient } = require('./lib/generated/prisma');
const prisma = new PrismaClient();

async function run() {
    try {
        const customer = await prisma.customer.findFirst({ include: { vehicles: true } });
        const user = await prisma.user.findFirst();

        console.log("Simulating OS create for C:", customer.id, "V:", customer.vehicles[0].id, "S:", user.id);

        const os = await prisma.workOrder.create({
            data: {
                customerId: customer.id,
                vehicleId: customer.vehicles[0].id,
                status: 'ABERTA',
                createdById: user.id,
                sellerId: user.id,
                notes: "SIMULATION TEST",
                statusHistory: {
                    create: {
                        newStatus: 'ABERTA',
                        changedById: user.id,
                        notes: 'Abertura de OS via Simulação'
                    }
                }
            }
        });
        console.log("SUCCESS:", os.id);
    } catch (e) {
        console.error("FAILURE DETAILS:");
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

run();
