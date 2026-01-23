import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-utils";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    const user = await getAuthUser();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    try {
        const body = await req.json();
        const { newStatus, notes, sellerId } = body;

        const os = await prisma.workOrder.findUnique({
            where: { id: params.id },
            include: { items: true }
        });
        if (!os) return new NextResponse("Not found", { status: 404 });

        // If trying to finalize something already finalized, prevent duplicate financial records
        if ((os.status === 'FINALIZADA' || os.status === 'ENTREGUE') && (newStatus === 'FINALIZADA' || newStatus === 'ENTREGUE')) {
            return new NextResponse("Já finalizada", { status: 400 });
        }

        const result = await prisma.$transaction(async (tx) => {
            // 1. Update Status and Create History Log
            const updatedOS = await tx.workOrder.update({
                where: { id: params.id },
                data: {
                    ...(newStatus && { status: newStatus }),
                    ...(sellerId !== undefined && { sellerId: sellerId || null }),
                    ...(newStatus && {
                        statusHistory: {
                            create: {
                                oldStatus: os.status,
                                newStatus: newStatus,
                                changedById: user.id,
                                notes: notes || `Alteração de status para ${newStatus}`
                            }
                        }
                    })
                }
            });

            // 2. If reaching a terminal status, trigger side effects
            const wasTerminal = os.status === 'FINALIZADA' || os.status === 'ENTREGUE';
            const isNowTerminal = newStatus ? (newStatus === 'FINALIZADA' || newStatus === 'ENTREGUE') : wasTerminal;

            // CASE A: Entering Terminal Status (Finalizing)
            if (!wasTerminal && isNowTerminal && newStatus) {
                // 1. Create Financial Record
                const descriptionPrefix = os.vehicleId ? 'Ordem de Serviço' : 'Venda Balcão';

                // Calculate total cost for DRE
                let totalCost = 0;
                for (const item of os.items) {
                    if (item.type === 'PART' && item.catalogItemId) {
                        const part = await tx.part.findUnique({
                            where: { id: item.catalogItemId },
                            select: { costPrice: true }
                        });
                        if (part) {
                            totalCost += Number(item.quantity) * (Number(part.costPrice) || 0);
                        }
                    }
                }

                const paymentMethod = body.paymentMethod || 'CASH';
                const isPaid = paymentMethod !== 'BOLETO';

                await tx.financialRecord.create({
                    data: {
                        description: `${descriptionPrefix} #${os.code} - Finalizada`,
                        type: 'INCOME',
                        amount: Number(os.totalValue),
                        status: isPaid ? 'PAID' : 'PENDING',
                        paymentMethod: paymentMethod,
                        category: 'SERVICE_REVENUE',
                        costAmount: totalCost,
                        workOrderId: os.id,
                        paidAt: isPaid ? new Date() : null
                    }
                });

                // 2. Stock Decrement
                for (const item of os.items) {
                    if (item.type === 'PART' && item.catalogItemId) {
                        await tx.part.update({
                            where: { id: item.catalogItemId },
                            data: { stockQuantity: { decrement: Number(item.quantity) } }
                        });
                        await tx.stockMovement.create({
                            data: {
                                partId: item.catalogItemId,
                                type: 'OUT',
                                quantity: Number(item.quantity),
                                referenceId: `OS #${os.code}`,
                                createdAt: new Date() // explicit for trace
                            }
                        });
                    }
                }
            }
            // CASE B: Leaving Terminal Status (Reopening)
            else if (wasTerminal && !isNowTerminal) {
                // 1. Stock Restore (Storno)
                for (const item of os.items) {
                    if (item.type === 'PART' && item.catalogItemId) {
                        await tx.part.update({
                            where: { id: item.catalogItemId },
                            data: { stockQuantity: { increment: Number(item.quantity) } }
                        });
                        await tx.stockMovement.create({
                            data: {
                                partId: item.catalogItemId,
                                type: 'IN', // Stock coming back
                                quantity: Number(item.quantity),
                                referenceId: `ESTORNO OS #${os.code}`,
                            }
                        });
                    }
                }

                // 2. Note: We could cancel/delete the financial record here, 
                // but let's stick to stock as requested to avoid breaking balance history if not asked.
            }

            return updatedOS;
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error("Status Update Error:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
