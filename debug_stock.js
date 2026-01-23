const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const codes = [18, 19, 20];
    console.log('--- BUSCANDO OS #18, #19, #20 ---');

    for (const code of codes) {
        const os = await prisma.workOrder.findFirst({
            where: { code: code },
            include: {
                items: {
                    where: { type: 'PART' }
                }
            }
        });

        if (!os) {
            console.log(`OS #${code} não encontrada.`);
            continue;
        }

        console.log(`\nOS #${os.code} (ID: ${os.id}) - Status: ${os.status}`);
        console.log(`Itens (Peças):`);
        for (const item of os.items) {
            const part = await prisma.part.findUnique({ where: { id: item.catalogItemId || '' } });
            console.log(`- ${item.name}: Qtd ${item.quantity} (Estoque atual: ${part?.stockQuantity})`);

            const movements = await prisma.stockMovement.findMany({
                where: { referenceId: os.id, partId: item.catalogItemId || '' }
            });
            console.log(`  Movimentações: ${movements.length > 0 ? movements.map(m => `${m.type} ${m.quantity}`).join(', ') : 'Nenhuma'}`);
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
