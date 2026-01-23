import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-utils";
import { startOfDay, endOfDay } from "date-fns";

export async function GET(req: Request) {
    const user = await getAuthUser();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    const today = new Date();
    const start = startOfDay(today);
    const end = endOfDay(today);

    try {
        // 1. Faturamento Total (PAID income records today)
        const incomeRecords = await prisma.financialRecord.findMany({
            where: {
                type: 'INCOME',
                status: 'PAID',
                paidAt: { gte: start, lte: end }
            },
            include: { workOrder: true }
        });

        const faturamento = incomeRecords.reduce((acc, curr) => acc + Number(curr.amount), 0);

        // 2. Desconto Concedido (Sum of discounts on work orders finalized today)
        const finalizedOrders = await prisma.workOrder.findMany({
            where: {
                status: { in: ['FINALIZADA', 'ENTREGUE'] },
                updatedAt: { gte: start, lte: end }
            },
            include: {
                items: {
                    where: { type: 'PART' }
                }
            }
        });

        const desconto = finalizedOrders.reduce((acc, curr) => acc + Number(curr.discount), 0);

        // 3. Faturamento Líquido
        const faturamentoLiquido = faturamento - desconto;

        // 4. CMV (Custo da Mercadoria Vendida)
        let cmv = 0;
        for (const os of finalizedOrders) {
            for (const item of os.items) {
                if (item.catalogItemId) {
                    const part = await prisma.part.findUnique({
                        where: { id: item.catalogItemId },
                        select: { costPrice: true }
                    });
                    if (part) {
                        const cost = Number(part.costPrice) || 0;
                        cmv += Number(item.quantity) * cost;
                    }
                }
            }
        }

        // 5. Impostos (Simulated 5% for now, can be adjusted)
        const impostos = faturamentoLiquido * 0.05;

        // 6. Lucro Líquido
        const lucroLiquido = faturamentoLiquido - cmv - impostos;

        // 7. Percentual de Lucro
        const percentualLucro = faturamentoLiquido > 0 ? (lucroLiquido / faturamentoLiquido) * 100 : 0;

        // 8. Qtd OS Abertas
        const opens = await prisma.workOrder.count({
            where: {
                status: { notIn: ['FINALIZADA', 'ENTREGUE'] },
                vehicleId: { not: null as any }
            }
        });

        // 9. Ticket Médio
        const salesCount = finalizedOrders.length;
        const ticketMedio = salesCount > 0 ? faturamento / salesCount : 0;

        return NextResponse.json({
            faturamento,
            desconto,
            faturamentoLiquido,
            impostos,
            cmv,
            lucroLiquido,
            percentualLucro,
            osAbertas: opens,
            ticketMedio
        });

    } catch (error) {
        console.error("Report Error:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
