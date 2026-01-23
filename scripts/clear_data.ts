
import { PrismaClient } from '../lib/generated/prisma'

const prisma = new PrismaClient()

async function main() {
    console.log('Starting data clear...')

    // Due to foreign key constraints and cascade delete not always being 100% implicitly reliable in "deleteMany" without raw SQL or proper setup,
    // we can rely on the DB cascade if "prisma db push" was successful. 
    // But to be sure, we can delete from child to parent or just try deleting customers if cascade is set.

    // Since we updated schema with onDelete: Cascade, deleting customers should work.
    try {
        const deletedCustomers = await prisma.customer.deleteMany({})
        console.log(`Deleted ${deletedCustomers.count} customers (and cascaded data).`)
    } catch (e) {
        console.error("Error deleting data:", e)
    }
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
