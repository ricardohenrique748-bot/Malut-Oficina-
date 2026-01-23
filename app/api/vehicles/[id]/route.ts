import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorize } from "@/lib/auth-utils";

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    const { error } = await authorize(['ADMIN', 'GERENTE']);
    if (error) return error;

    try {
        await prisma.vehicle.delete({ where: { id: params.id } });
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}
