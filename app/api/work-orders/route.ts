import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorize, getAuthUser } from "@/lib/auth-utils";

export async function GET(req: Request) {
    const user = await getAuthUser();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const whereClause: any = {};
    if (status && status !== 'ALL') whereClause.status = status;

    if (user.role.name === 'MECANICO') {
        whereClause.OR = [
            { responsibleId: user.id },
            { status: 'ABERTA' },
            { status: 'EM_EXECUCAO', responsibleId: user.id }
        ];
    }

    try {
        const workOrders = await prisma.workOrder.findMany({
            where: whereClause,
            include: {
                customer: { select: { name: true, phone: true } },
                vehicle: { select: { plate: true, brand: true, model: true } },
                responsible: { select: { name: true } },
                seller: { select: { name: true } }
            },
            orderBy: { createdAt: 'desc' },
            take: 50
        });

        return NextResponse.json(workOrders);
    } catch (error) {
        console.error(error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function POST(req: Request) {
    const { error, user } = await authorize(['ADMIN', 'RECEPCAO', 'GERENTE']);
    if (error) return error;

    let body;
    try {
        body = await req.json();
    } catch (e) {
        return new NextResponse("Invalid JSON", { status: 400 });
    }

    const { customerId, vehicleId, notes, scheduledFor, sellerId } = body;

    // Log attempt
    try {
        const fs = require('fs');
        fs.appendFileSync('os_attempts.log', `[${new Date().toISOString()}] Attempt: ${JSON.stringify({ body, userId: user.id })}\n`);
    } catch (e) { }

    if (!customerId || !vehicleId) {
        return new NextResponse("Missing data", { status: 400 });
    }

    try {
        // Create OS
        const os = await prisma.workOrder.create({
            data: {
                customerId,
                vehicleId,
                status: 'ABERTA',
                createdById: user.id,
                sellerId: sellerId || null,
                notes,
                scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
                statusHistory: {
                    create: {
                        newStatus: 'ABERTA',
                        changedById: user.id,
                        notes: 'Abertura de OS'
                    }
                }
            } as any
        });

        return NextResponse.json(os);
    } catch (error: any) {
        console.error("OS CREATE ERROR:", error);
        try {
            const fs = require('fs');
            fs.appendFileSync('os_attempts.log', `[${new Date().toISOString()}] FAILURE: ${error.message}\n${error.stack}\n`);
        } catch (e) { }

        return new NextResponse(`Internal Error: ${error.message}`, { status: 500 });
    }
}
