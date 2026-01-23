const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const part = await prisma.part.findFirst({ where: { name: { contains: 'Filtro', mode: 'insensitive' } } });
    const moves = await prisma.stockMovement.findMany({ where: { partId: part.id }, orderBy: { createdAt: 'desc' } });
    const osList = await prisma.workOrder.findMany({ select: { id: true, code: true } });

    console.log('--- MOVIMENTAÇÕES ---');
    for (const m of moves) {
        const osFound = osList.find(os => os.id === m.referenceId);
        console.log(`[${m.createdAt.toISOString()}] ${m.type} ${m.quantity}`);
        console.log(`  Ref Bruta: ${m.referenceId}`);
        console.log(`  Identificados: ${osFound ? 'OS #' + osFound.code : 'NÃO IDENTIFICADO'}`);
    }
}
main().finally(() => prisma.$disconnect());
