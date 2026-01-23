const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function audit() {
    const codes = [18, 19, 20];
    console.log('AUDITORIA DE ESTOQUE - OS 18, 19, 20');

    for (const code of codes) {
        const os = await prisma.workOrder.findFirst({
            where: { code: code },
            include: { items: true }
        });

        if (!os) {
            console.log(`\nOS #${code}: Não encontrada.`);
            continue;
        }

        console.log(`\nOS #${os.code} (ID: ${os.id}) - Status: ${os.status}`);

        const parts = os.items.filter(i => i.type === 'PART');
        console.log(`Peças na OS: ${parts.length}`);

        for (const part of parts) {
            console.log(`- Item: ${part.name} (ID Catálogo: ${part.catalogItemId})`);

            const movements = await prisma.stockMovement.findMany({
                where: {
                    partId: part.catalogItemId,
                    OR: [
                        { referenceId: os.id },
                        { referenceId: `OS #${os.code}` }
                    ]
                }
            });

            if (movements.length > 0) {
                movements.forEach(m => console.log(`  [MOV OK] ${m.type} ${m.quantity} Ref: ${m.referenceId}`));
            } else {
                console.log(`  [ERRO] Nenhuma movimentação encontrada para esta peça nesta OS.`);
            }
        }
    }
}

audit().finally(() => prisma.$disconnect());
