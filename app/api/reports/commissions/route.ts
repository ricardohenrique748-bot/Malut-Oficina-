import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorize } from "@/lib/auth-utils";

export async function GET(req: Request) {
    const { error } = await authorize(['ADMIN', 'GERENTE']);
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const start = searchParams.get('start') ? new Date(searchParams.get('start')!) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end = searchParams.get('end') ? new Date(searchParams.get('end')!) : new Date();

    try {
        // Find all active staff with a commission rate > 0
        const staff = await prisma.user.findMany({
            where: {
                active: true,
                commissionRate: { gt: 0 }
            },
            include: { role: true }
        });

        const report = [];

        for (const worker of staff) {
            const isMechanic = worker.role.name === 'MECANICO';
            const isSeller = ['VENDEDOR', 'RECEPCAO', 'GERENTE', 'ADMIN'].includes(worker.role.name);

            // Fetch orders where this worker was either responsible (mechanic) or seller
            const orders = await prisma.workOrder.findMany({
                where: {
                    OR: [
                        { responsibleId: worker.id },
                        { sellerId: worker.id }
                    ],
                    status: { in: ['FINALIZADA', 'ENTREGUE'] },
                    updatedAt: { gte: start, lte: end }
                },
                include: { items: true }
            });

            let totalBaseValue = 0;
            let commissionEarned = 0;
            const individualRate = Number(worker.commissionRate || 0);

            for (const os of orders) {
                if (isMechanic && os.responsibleId === worker.id) {
                    // Commissions for mechanics usually base on Labor (Services)
                    const laborTotal = os.items
                        .filter(item => item.type === 'SERVICE')
                        .reduce((sum, item) => sum + Number(item.total), 0);

                    totalBaseValue += laborTotal;
                    commissionEarned += (laborTotal * individualRate) / 100;
                }

                if (isSeller && os.sellerId === worker.id) {
                    // Commissions for sellers base on Total Value of OS
                    const osTotal = Number(os.totalValue);
                    totalBaseValue += osTotal;
                    commissionEarned += (osTotal * individualRate) / 100;
                }
            }

            if (orders.length > 0) {
                report.push({
                    workerId: worker.id,
                    workerName: worker.name,
                    role: worker.role.name,
                    ordersCount: orders.length,
                    totalProduced: totalBaseValue,
                    commissionRate: individualRate,
                    commission: commissionEarned
                });
            }
        }

        return NextResponse.json(report);

        return NextResponse.json(report);
    } catch (error) {
        console.error(error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
