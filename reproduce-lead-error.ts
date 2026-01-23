import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
    try {
        console.log("1. Searching for Admin...");
        const systemUser = await prisma.user.findFirst({
            where: { role: { name: 'ADMIN' } }
        });
        console.log("Admin found:", systemUser?.id);

        const responsibleUser = systemUser || await prisma.user.findFirst();
        console.log("Responsible User:", responsibleUser?.id);

        if (!responsibleUser) throw new Error("No user found");

        console.log("2. Creating Customer...");
        const customer = await prisma.customer.create({
            data: {
                name: "Test Lead Error",
                email: `test_error_${Date.now()}@test.com`,
                phone: "11999999999"
            }
        });
        console.log("Customer created:", customer.id);

        console.log("3. Creating Lead...");
        const lead = await prisma.lead.create({
            data: {
                nome: "Test Lead Error",
                email: customer.email!,
                telefone: "11999999999",
                ramo: "Oficina",
                objetivo: "Suspensão",
                urgencia: "alta",
                statusKanban: "warm",
                scorePotencial: 75,
                tagsAi: JSON.stringify(["Teste"]),
                resumoAi: "Teste"
            }
        });
        console.log("Lead created:", lead.id);

        console.log("4. Creating WorkOrder...");
        const workOrder = await prisma.workOrder.create({
            data: {
                customerId: customer.id,
                notes: "Test Notes",
                status: 'ABERTA',
                createdById: responsibleUser.id,
                totalParts: 0,
                totalLabor: 0,
                totalValue: 0,
                discount: 0
            }
        });
        console.log("WorkOrder created:", workOrder.id);
        console.log("SUCCESS");

    } catch (e) {
        console.error("ERROR CAUGHT:", e);
    } finally {
        await prisma.$disconnect();
    }
}

run();
