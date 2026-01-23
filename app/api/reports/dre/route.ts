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
        const records = await prisma.financialRecord.findMany({
            where: {
                status: 'PAID',
                paidAt: { gte: start, lte: end }
            }
        });

        const grossRevenue = records.filter(r => r.type === 'INCOME').reduce((acc, r) => acc + Number(r.amount), 0);
        const cmv = records.filter(r => r.type === 'INCOME').reduce((acc, r) => acc + Number(r.costAmount || 0), 0);

        const operatingExpenses = records.filter(r => r.type === 'EXPENSE').reduce((acc, r) => acc + Number(r.amount), 0);

        // Simplified tax (e.g. 5%)
        const taxes = grossRevenue * 0.05;

        const netProfit = grossRevenue - cmv - operatingExpenses - taxes;
        const profitMargin = grossRevenue > 0 ? (netProfit / grossRevenue) * 100 : 0;

        return NextResponse.json({
            grossRevenue,
            cmv,
            grossProfit: grossRevenue - cmv,
            operatingExpenses,
            taxes,
            netProfit,
            profitMargin,
            period: { start, end }
        });
    } catch (error) {
        console.error(error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
