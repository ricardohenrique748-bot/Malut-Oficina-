import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorize } from "@/lib/auth-utils";

export async function POST(req: Request) {
    const { error, user } = await authorize(['ADMIN', 'RECEPCAO', 'GERENTE']);
    if (error) return error;

    try {
        const body = await req.json();
        const { customerId, vehicleId, items, discount, paymentMethod, status, introduction, notes } = body;

        // Valid statuses: 'FINALIZADA' (Venda) or 'ORCAMENTO' (Proposta)
        // Default to FINALIZADA if not provided, but frontend sends it.
        const orderStatus = status === 'ORCAMENTO' ? 'ORCAMENTO' : 'FINALIZADA';

        if (!customerId || !items || items.length === 0) {
            return new NextResponse("Missing data", { status: 400 });
        }

        // Transaction
        const result = await prisma.$transaction(async (tx) => {
            // 1. Create Work Order
            const os = await tx.workOrder.create({
                data: {
                    customerId,
                    vehicleId: vehicleId || null, // Allow null for PDV
                    status: orderStatus,
                    createdById: user.id,
                    notes: introduction ? `${introduction}\n\n${notes || ''}` : notes || 'Venda PDV',
                    discount: discount || 0,
                    statusHistory: {
                        create: {
                            newStatus: orderStatus,
                            changedById: user.id,
                            notes: orderStatus === 'ORCAMENTO' ? 'Proposta Criada' : 'Venda Finalizada PDV'
                        }
                    }
                }
            });

            // 2. Add Items
            let totalParts = 0;
            let totalLabor = 0;

            for (const item of items) {
                // item: { type, id, quantity, price, name, discountPercent }
                const itemPrice = Number(item.price);
                const itemQty = Number(item.quantity);
                const discountPercent = Number(item.discountPercent || 0);

                // Calculate item total with discount
                const grossTotal = itemPrice * itemQty;
                const discountAmount = grossTotal * (discountPercent / 100);
                const netTotal = grossTotal - discountAmount;

                await tx.workOrderItem.create({
                    data: {
                        workOrderId: os.id,
                        type: item.type,
                        catalogItemId: item.id,
                        name: item.name,
                        quantity: itemQty,
                        unitPrice: itemPrice,
                        total: netTotal
                    }
                });

                if (item.type === 'PART') {
                    totalParts += netTotal;

                    // ONLY DECREMENT STOCK IF FINALIZED
                    if (orderStatus === 'FINALIZADA') {
                        await tx.part.update({
                            where: { id: item.id },
                            data: { stockQuantity: { decrement: itemQty } }
                        });
                        await tx.stockMovement.create({
                            data: {
                                partId: item.id,
                                type: 'OUT',
                                quantity: itemQty,
                                referenceId: `OS #${os.code}`
                            }
                        });
                    }
                } else {
                    totalLabor += netTotal;
                }
            }

            // 3. Update OS Totals
            // The 'discount' passed from frontend is the GLOBAL discount value.
            // Items already have their net totals summed up in totalParts/totalLabor.
            const subtotal = totalParts + totalLabor;
            const finalValue = subtotal - (Number(discount) || 0);

            await tx.workOrder.update({
                where: { id: os.id },
                data: {
                    totalParts,
                    totalLabor,
                    totalValue: finalValue
                }
            });

            // 4. Create Financial Record (ONLY IF FINALIZED)
            if (orderStatus === 'FINALIZADA') {
                const isPaid = paymentMethod !== 'BOLETO';

                await tx.financialRecord.create({
                    data: {
                        description: `Venda Balcão #${os.code} - Finalizada`,
                        type: 'INCOME',
                        amount: finalValue,
                        status: isPaid ? 'PAID' : 'PENDING',
                        paymentMethod: paymentMethod || 'CASH', // Default to CASH if missing
                        workOrderId: os.id,
                        paidAt: isPaid ? new Date() : null
                    }
                });
            }

            return os;
        });

        return NextResponse.json(result);

    } catch (error) {
        console.error(error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
