import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-utils";

export async function DELETE(
    req: Request,
    { params }: { params: { id: string; itemId: string } }
) {
    const user = await getAuthUser();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    try {
        // Delete the item
        await prisma.workOrderItem.delete({
            where: { id: params.itemId }
        });

        // Recalculate totals
        const os = await prisma.workOrder.findUnique({
            where: { id: params.id },
            include: { items: true }
        });

        if (os) {
            const totalParts = os.items
                .filter(i => i.type === 'PART')
                .reduce((sum, i) => sum + Number(i.total), 0);

            const totalLabor = os.items
                .filter(i => i.type === 'SERVICE')
                .reduce((sum, i) => sum + Number(i.total), 0);

            await prisma.workOrder.update({
                where: { id: params.id },
                data: {
                    totalParts,
                    totalLabor,
                    totalValue: totalParts + totalLabor
                }
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
