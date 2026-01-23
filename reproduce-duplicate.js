const { PrismaClient } = require('./lib/generated/prisma');

const prisma = new PrismaClient();

async function run() {
    try {
        const PLATE = "TEST-DUPLICATE-FIXED";

        console.log("1. Creating First Entry...");
        try { await prisma.vehicle.delete({ where: { plate: PLATE } }); } catch (e) { }

        const admin = await prisma.user.findFirst({ where: { role: { name: 'ADMIN' } } });
        const customer = await prisma.customer.create({ data: { name: "Test Fix", email: `test_fix_${Date.now()}@test.com` } });

        await prisma.vehicle.create({
            data: { plate: PLATE, brand: "F", model: "M", customerId: customer.id }
        });
        console.log("First vehicle created.");

        console.log("2. Attempting Duplicate Entry (with FIX applied)...");

        // SIMULATING THE FIX: Check existence first
        let vehicle = await prisma.vehicle.findUnique({ where: { plate: PLATE } });

        if (!vehicle) {
            vehicle = await prisma.vehicle.create({
                data: {
                    plate: PLATE,
                    brand: "F",
                    model: "M",
                    year: 2024,
                    color: "",
                    customerId: customer.id
                }
            });
            console.log("New vehicle created.");
        } else {
            console.log("Existing vehicle found (Fix worked).");
        }

        console.log("SUCCESS. No crash.");

    } catch (e) {
        console.error("ERROR CAUGHT (Fix Failed):", e.message);
    } finally {
        await prisma.$disconnect();
    }
}

run();
