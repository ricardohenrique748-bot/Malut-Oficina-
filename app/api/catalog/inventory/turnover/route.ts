import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorize } from "@/lib/auth-utils";
import { subDays } from "date-fns";

export async function GET() {
    const { error } = await authorize(['ADMIN', 'RECEPCAO', 'MECANICO', 'GERENTE']);
    if (error) return error;

    try {
        const thirtyDaysAgo = subDays(new Date(), 30);

        // Get all OUT movements in the last 30 days
        const movements = await prisma.stockMovement.findMany({
            where: {
                type: 'OUT',
                createdAt: {
                    gte: thirtyDaysAgo
                }
            },
            include: {
                part: {
                    select: {
                        name: true,
                        sku: true,
                        stockQuantity: true,
                        price: true
                    }
                }
            }
        });

        // Aggragate by part
        const turnoverMap = new Map();

        movements.forEach(mov => {
            const current = turnoverMap.get(mov.partId) || {
                id: mov.partId,
                name: mov.part.name,
                sku: mov.part.sku,
                currentStock: Number(mov.part.stockQuantity),
                totalOut: 0,
                frequency: 0,
                revenue: 0
            };

            current.totalOut += Number(mov.quantity);
            current.frequency += 1;
            current.revenue += Number(mov.quantity) * Number(mov.part.price);

            turnoverMap.set(mov.partId, current);
        });

        const turnoverList = Array.from(turnoverMap.values())
            .sort((a, b) => b.totalOut - a.totalOut);

        return NextResponse.json(turnoverList);
    } catch (error) {
        console.error("Turnover API Error:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
