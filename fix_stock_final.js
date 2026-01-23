const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fix() {
    console.log('--- INICIANDO RECONCILIAÇÃO DE ESTOQUE ---');

    // 1. Corrigir OS #18 (Faltando saída)
    const os18 = await prisma.workOrder.findFirst({
        where: { code: 18 },
        include: { items: { where: { type: 'PART' } } }
    });

    if (os18 && os18.status === 'FINALIZADA') {
        console.log('Corrigindo OS #18...');
        for (const item of os18.items) {
            if (item.catalogItemId) {
                // Criar movimento
                await prisma.stockMovement.create({
                    data: {
                        partId: item.catalogItemId,
                        type: 'OUT',
                        quantity: Number(item.quantity),
                        referenceId: `OS #18`,
                        createdAt: os18.updatedAt // Manter coerência temporal
                    }
                });
                // Baixar estoque
                await prisma.part.update({
                    where: { id: item.catalogItemId },
                    data: { stockQuantity: { decrement: Number(item.quantity) } }
                });
                console.log(`- Peça "${item.name}" baixada.`);
            }
        }
    }

    // 2. Corrigir Referências de UUID para Human-Readable (OS #19)
    console.log('\nLimpando referências de UUID legadas...');
    const moves = await prisma.stockMovement.findMany();
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    for (const m of moves) {
        if (m.referenceId && uuidRegex.test(m.referenceId)) {
            const os = await prisma.workOrder.findUnique({
                where: { id: m.referenceId },
                select: { code: true }
            });
            if (os) {
                await prisma.stockMovement.update({
                    where: { id: m.id },
                    data: { referenceId: `OS #${os.code}` }
                });
                console.log(`- Movimento atualizado: ${m.referenceId} -> OS #${os.code}`);
            }
        }
    }

    console.log('\n--- SUCESSO ---');
}

fix().finally(() => prisma.$disconnect());
