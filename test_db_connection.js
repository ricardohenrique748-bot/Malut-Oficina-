const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: "postgresql://app_user:AppUserPass123!@db.xhfukexobxdgwknrlbzt.supabase.co:5432/postgres" // Trying the local env copy credential
        }
    }
});

async function main() {
    try {
        await prisma.$connect();
        console.log("Connected successfully with app_user!");
        const count = await prisma.user.count();
        console.log(`User count: ${count}`);
    } catch (e) {
        console.error("Connection failed:", e.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
