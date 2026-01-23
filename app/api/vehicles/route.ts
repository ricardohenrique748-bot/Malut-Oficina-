import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorize, getAuthUser } from "@/lib/auth-utils";

export async function GET(req: Request) {
    const user = await getAuthUser();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");

    try {
        const vehicles = await prisma.vehicle.findMany({
            where: search ? {
                OR: [
                    { plate: { contains: search, mode: 'insensitive' } },
                    { model: { contains: search, mode: 'insensitive' } },
                    { brand: { contains: search, mode: 'insensitive' } }
                ]
            } : undefined,
            include: { customer: true },
            orderBy: { createdAt: 'desc' },
            take: 50
        });
        return NextResponse.json(vehicles);
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function POST(req: Request) {
    const { error } = await authorize(['ADMIN', 'RECEPCAO', 'GERENTE']);
    if (error) return error;

    try {
        const body = await req.json();
        const { plate, brand, model, color, year, customerId } = body;

        if (!plate || !customerId) {
            return new NextResponse("Missing fields", { status: 400 });
        }

        const vehicle = await prisma.vehicle.create({
            data: {
                plate: plate.toUpperCase(),
                brand,
                model,
                color,
                year: year ? parseInt(year) : undefined,
                customerId
            }
        });

        return NextResponse.json(vehicle);
    } catch (error) {
        console.error(error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
