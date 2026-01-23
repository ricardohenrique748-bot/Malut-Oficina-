const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
    for (const c of [18, 19, 20]) {
        const os = await prisma.workOrder.findFirst({ where: { code: c } });
        if (!os) continue;
        const moves = await prisma.stockMovement.findMany({
            where: { OR: [{ referenceId: os.id }, { referenceId: "OS #" + os.code }] }
        });
        console.log(`OS #${c}: ${moves.length} moves. (Last: ${moves[0]?.referenceId})`);
    }
}
run().finally(() => prisma.$disconnect());
