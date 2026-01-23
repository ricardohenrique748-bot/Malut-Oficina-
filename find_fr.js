const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function find() {
    const id = "001509f1-48a6-40e8-b33f-f57bf5bcaaa1";
    const fr = await prisma.financialRecord.findUnique({ where: { id }, include: { workOrder: true } });
    if (fr) {
        console.log('FinancialRecord found:', fr.description);
        console.log('Linked OS:', fr.workOrder?.code || 'None');
    } else {
        console.log('FinancialRecord not found');
    }
}
find().finally(() => prisma.$disconnect());
