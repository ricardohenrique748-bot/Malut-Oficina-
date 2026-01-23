import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorize } from "@/lib/auth-utils";

export async function GET(req: Request) {
    const { error } = await authorize(['ADMIN', 'FINANCEIRO', 'GERENTE']);
    if (error) return error;

    try {
        const closures = await prisma.cashClosure.findMany({
            orderBy: { date: 'desc' },
            take: 30
        });
        return NextResponse.json(closures);
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function POST(req: Request) {
    const { error, user } = await authorize(['ADMIN', 'FINANCEIRO', 'GERENTE']);
    if (error) return error;

    try {
        const body = await req.json();
        const { date, manualTotal, systemTotal, observations } = body;

        const closureDate = date ? new Date(date) : new Date();
        closureDate.setHours(0, 0, 0, 0);

        const difference = Number(manualTotal) - Number(systemTotal);

        const closure = await prisma.cashClosure.upsert({
            where: { date: closureDate },
            update: {
                systemTotal: Number(systemTotal),
                manualTotal: Number(manualTotal),
                difference: Number(difference),
                observations,
                closedById: user.id
            },
            create: {
                date: closureDate,
                systemTotal: Number(systemTotal),
                manualTotal: Number(manualTotal),
                difference: Number(difference),
                observations,
                closedById: user.id
            }
        });

        return NextResponse.json(closure);
    } catch (error) {
        console.error(error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
