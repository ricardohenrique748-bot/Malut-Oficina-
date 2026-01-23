const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
    const part = await prisma.part.findFirst({ where: { name: { contains: 'Filtro', mode: 'insensitive' } } });
    const moves = await prisma.stockMovement.findMany({ where: { partId: part.id } });

    console.log(`Part: ${part.name} (${part.id})`);
    for (const m of moves) {
        console.log(`[${m.type}] Qty: ${m.quantity} Ref: ${m.referenceId}`);
    }

    console.log('\n--- ALL WORK ORDERS ---');
    const oss = await prisma.workOrder.findMany({ select: { id: true, code: true } });
    for (const os of oss) {
        console.log(`OS #${os.code}: ${os.id}`);
    }
}
run().finally(() => prisma.$disconnect());
