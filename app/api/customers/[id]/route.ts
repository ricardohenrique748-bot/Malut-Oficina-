import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorize, getAuthUser } from "@/lib/auth-utils";

export async function GET(req: Request, { params }: { params: { id: string } }) {
    const user = await getAuthUser();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    try {
        const customer = await prisma.customer.findUnique({
            where: { id: params.id },
            include: {
                vehicles: {
                    orderBy: { createdAt: 'desc' }
                },
                workOrders: {
                    orderBy: { createdAt: 'desc' },
                    take: 5
                }
            }
        });

        if (!customer) return new NextResponse("Not Found", { status: 404 });

        return NextResponse.json(customer);
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    const { error, user } = await authorize(['ADMIN', 'RECEPCAO', 'GERENTE']);
    if (error) return error;

    try {
        const body = await req.json();
        const customer = await prisma.customer.update({
            where: { id: params.id },
            data: body
        });
        return NextResponse.json(customer);
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    const { error } = await authorize(['ADMIN', 'GERENTE']);
    if (error) return error;

    try {
        await prisma.customer.delete({ where: { id: params.id } });
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        return new NextResponse("Internal Error (Maybe linked records?)", { status: 500 });
    }
}
