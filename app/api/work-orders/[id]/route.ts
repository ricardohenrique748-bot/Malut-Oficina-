import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorize, getAuthUser } from "@/lib/auth-utils";

export async function GET(req: Request, { params }: { params: { id: string } }) {
    const user = await getAuthUser();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    try {
        const os = await prisma.workOrder.findUnique({
            where: { id: params.id },
            include: {
                customer: true,
                vehicle: true,
                items: true,
                responsible: { select: { name: true } },
                createdBy: { select: { name: true } },
                statusHistory: {
                    orderBy: { createdAt: 'desc' },
                    include: { changedBy: { select: { name: true } } }
                }
            }
        });

        if (!os) return new NextResponse("Not Found", { status: 404 });

        return NextResponse.json(os);
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }

}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    const user = await getAuthUser();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    try {
        const body = await req.json();
        const os = await prisma.workOrder.update({
            where: { id: params.id },
            data: body
        });
        return NextResponse.json(os);
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    const { error } = await authorize(['ADMIN']);
    if (error) return error;

    try {
        const result = await prisma.$transaction(async (tx) => {
            const os = await tx.workOrder.findUnique({
                where: { id: params.id },
                include: { items: true }
            });

            if (!os) return null;

            // If finalized, restore stock before deleting
            const isTerminal = os.status === 'FINALIZADA' || os.status === 'ENTREGUE';
            if (isTerminal) {
                for (const item of os.items) {
                    if (item.type === 'PART' && item.catalogItemId) {
                        await tx.part.update({
                            where: { id: item.catalogItemId },
                            data: { stockQuantity: { increment: Number(item.quantity) } }
                        });
                        await tx.stockMovement.create({
                            data: {
                                partId: item.catalogItemId,
                                type: 'IN',
                                quantity: Number(item.quantity),
                                referenceId: `DELETED_OS_${os.code}`
                            }
                        });
                    }
                }
            }

            // Finally delete
            await tx.workOrder.delete({
                where: { id: params.id }
            });

            return { success: true };
        });

        if (!result) return new NextResponse("Not Found", { status: 404 });
        return NextResponse.json(result);
    } catch (error) {
        console.error("Delete Error:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
