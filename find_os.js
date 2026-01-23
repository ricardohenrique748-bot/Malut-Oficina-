const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function find() {
    const id = "001509f1-48a6-40e8-b33f-f57bf5bcaaa1";
    const os = await prisma.workOrder.findUnique({ where: { id } });
    console.log('OS found for ID:', os?.code || 'Not found');
}
find().finally(() => prisma.$disconnect());
