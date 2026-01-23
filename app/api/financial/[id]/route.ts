import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorize } from "@/lib/auth-utils";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    const { error } = await authorize(['ADMIN', 'FINANCEIRO', 'GERENTE']);
    if (error) return error;

    try {
        const body = await req.json();
        const { description, amount, type, status, paidAt } = body;

        const record = await prisma.financialRecord.update({
            where: { id: params.id },
            data: {
                description,
                amount: amount ? Number(amount) : undefined,
                type,
                status,
                paidAt: paidAt ? new Date(paidAt) : undefined
            }
        });

        return NextResponse.json(record);
    } catch (error) {
        console.error(error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    const { error } = await authorize(['ADMIN', 'FINANCEIRO', 'GERENTE']);
    if (error) return error;

    try {
        await prisma.financialRecord.delete({
            where: { id: params.id }
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
