import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-utils";

export async function POST(req: Request, { params }: { params: { id: string } }) {
    const user = await getAuthUser();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    try {
        const body = await req.json();
        const { type, name, unitPrice, quantity, catalogItemId } = body; // type: PART | SERVICE

        const qty = Number(quantity);
        const price = Number(unitPrice);
        const total = qty * price;

        // Create Item
        await prisma.workOrderItem.create({
            data: {
                workOrderId: params.id,
                type,
                name,
                unitPrice: price,
                quantity: qty,
                total,
                catalogItemId
            }
        });

        // Recalculate OS Totals
        const allItems = await prisma.workOrderItem.findMany({ where: { workOrderId: params.id } });

        let totalParts = 0;
        let totalLabor = 0;

        allItems.forEach(item => {
            if (item.type === 'PART') totalParts += Number(item.total);
            if (item.type === 'SERVICE') totalLabor += Number(item.total);
        });

        await prisma.workOrder.update({
            where: { id: params.id },
            data: {
                totalParts,
                totalLabor,
                totalValue: totalParts + totalLabor
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
