import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorize } from "@/lib/auth-utils";

export async function GET(req: Request) {
    const { error } = await authorize(['ADMIN', 'RECEPCAO', 'GERENTE']);
    if (error) return error;

    try {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        // Find customers whose last work order was more than 6 months ago, or who never had one
        const customers = await prisma.customer.findMany({
            where: {
                workOrders: {
                    none: {
                        updatedAt: { gte: sixMonthsAgo }
                    }
                }
            },
            include: {
                workOrders: {
                    orderBy: { updatedAt: 'desc' },
                    take: 1
                },
                vehicles: true
            }
        });

        const returnList = customers.map(c => ({
            id: c.id,
            name: c.name,
            phone: c.phone,
            lastServiceDate: c.workOrders[0]?.updatedAt || null,
            vehicle: c.vehicles[0] ? `${c.vehicles[0].brand} ${c.vehicles[0].model}` : "Não cadastrado",
            daysSinceLastService: c.workOrders[0] ? Math.floor((new Date().getTime() - c.workOrders[0].updatedAt.getTime()) / (1000 * 60 * 60 * 24)) : null
        }));

        return NextResponse.json(returnList);
    } catch (error) {
        console.error(error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
