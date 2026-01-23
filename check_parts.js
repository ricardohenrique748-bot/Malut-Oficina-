const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
    const parts = await prisma.part.findMany({ where: { name: { contains: 'Filtro', mode: 'insensitive' } } });
    parts.forEach(p => console.log(`Part ID: ${p.id}, Name: ${p.name}, Stock: ${p.stockQuantity}`));
}
run().finally(() => prisma.$disconnect());
