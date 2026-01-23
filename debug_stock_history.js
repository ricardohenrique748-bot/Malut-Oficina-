const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const os20 = await prisma.workOrder.findFirst({
        where: { code: 20 },
        include: { items: { where: { type: 'PART' } } }
    });

    if (!os20 || os20.items.length === 0) {
        console.log('OS #20 ou itens não encontrados.');
        return;
    }

    const partId = os20.items[0].catalogItemId;
    const part = await prisma.part.findUnique({ where: { id: partId } });

    console.log(`--- MOVIMENTAÇÕES PARA: ${part.name} (Estoque: ${part.stockQuantity}) ---`);

    const movements = await prisma.stockMovement.findMany({
        where: { partId: partId },
        orderBy: { createdAt: 'desc' }
    });

    for (const mov of movements) {
        console.log(`[${mov.createdAt.toISOString()}] ${mov.type} ${mov.quantity} - Ref: ${mov.referenceId}`);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
