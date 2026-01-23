const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const partName = "Filtro Combustivel Universal Grande";
    const part = await prisma.part.findFirst({
        where: { name: { contains: partName, mode: 'insensitive' } }
    });

    if (!part) {
        console.log(`Peça "${partName}" não encontrada.`);
        return;
    }

    console.log(`--- MOVIMENTAÇÕES PARA: ${part.name} (ID: ${part.id}) ---`);

    const movements = await prisma.stockMovement.findMany({
        where: { partId: part.id },
        orderBy: { createdAt: 'desc' }
    });

    for (const mov of movements) {
        let osInfo = "N/A";
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

        if (mov.referenceId && uuidRegex.test(mov.referenceId)) {
            const os = await prisma.workOrder.findUnique({
                where: { id: mov.referenceId },
                select: { code: true }
            });
            if (os) osInfo = `OS #${os.code}`;
            else osInfo = "OS não encontrada p/ UUID";
        } else {
            osInfo = mov.referenceId || "Sem Ref";
        }

        console.log(`[${mov.createdAt.toISOString()}] ${mov.type} ${mov.quantity} - Ref Bruta: ${mov.referenceId} - Tradução: ${osInfo}`);
    }

    // Also check if OS #18 has items with this partId but no movement
    console.log('\n--- VERIFICANDO OS #18 ---');
    const os18 = await prisma.workOrder.findFirst({
        where: { code: 18 },
        include: { items: true }
    });
    if (os18) {
        console.log(`Status OS #18: ${os18.status}`);
        const item = os18.items.find(i => i.catalogItemId === part.id);
        if (item) {
            console.log(`OS #18 contém a peça. Qtd: ${item.quantity}`);
        } else {
            console.log(`OS #18 NÃO contém a peça.`);
        }
    } else {
        console.log('OS #18 não encontrada.');
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
