const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const codes = [18, 19, 20];
    console.log('--- RELATÓRIO DE ESTOQUE DE PEÇAS NAS OS #18, #19, #20 ---');

    for (const code of codes) {
        const os = await prisma.workOrder.findFirst({
            where: { code: code },
            include: { items: { where: { type: 'PART' } } }
        });

        if (!os) continue;

        console.log(`\nOS #${os.code} - Status: ${os.status}`);
        for (const item of os.items) {
            const part = await prisma.part.findUnique({ where: { id: item.catalogItemId || '' } });
            const moves = await prisma.stockMovement.findMany({ where: { referenceId: os.id, partId: part.id } });

            console.log(`  - Peça: ${item.name}`);
            console.log(`    Qtd na OS: ${item.quantity}`);
            console.log(`    Estoque Atual: ${part.stockQuantity}`);
            console.log(`    Movimentações (nesta OS): ${moves.map(m => m.type + ' ' + m.quantity).join(', ') || 'NENHUMA'}`);
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
