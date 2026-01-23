import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorize } from "@/lib/auth-utils";

export async function GET(req: Request) {
    const { error, user } = await authorize(['ADMIN', 'FINANCEIRO', 'GERENTE']);
    if (error) return error;

    try {
        const records = await prisma.financialRecord.findMany({
            orderBy: { createdAt: 'desc' },
            take: 100,
            include: {
                workOrder: {
                    select: { code: true, customer: { select: { name: true } } }
                }
            }
        });

        // Calculate totals on server side for simple MVP
        const balance = records.reduce((acc, r) => {
            const val = Number(r.amount);
            return r.type === 'INCOME' ? acc + val : acc - val;
        }, 0);

        return NextResponse.json({ records, balance });
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function POST(req: Request) {
    const { error } = await authorize(['ADMIN', 'FINANCEIRO', 'GERENTE']);
    if (error) return error;

    try {
        const body = await req.json();
        const { description, type, amount, status, paymentMethod, category, workOrderId } = body;

        const record = await prisma.financialRecord.create({
            data: {
                description,
                type, // INCOME or EXPENSE
                amount: Number(amount),
                status: status || 'PAID',
                paymentMethod: paymentMethod || null,
                category: category || null,
                workOrderId: workOrderId || null
            }
        });

        return NextResponse.json(record);
    } catch (error) {
        console.error(error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
