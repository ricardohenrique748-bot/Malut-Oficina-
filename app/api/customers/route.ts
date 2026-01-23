import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase-server";

export async function GET(req: Request) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        include: { role: true }
    });

    if (!dbUser) {
        return new NextResponse("Forbidden", { status: 403 });
    }

    // Permission check
    const allowedRoles = ['ADMIN', 'RECEPCAO', 'GERENTE', 'MECANICO'];
    if (!allowedRoles.includes(dbUser.role.name)) {
        return new NextResponse("Forbidden", { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");

    try {
        const customers = await prisma.customer.findMany({
            where: search ? {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { document: { contains: search } },
                    { email: { contains: search, mode: 'insensitive' } }
                ]
            } : undefined,
            orderBy: { createdAt: 'desc' },
            take: 50
        });

        return NextResponse.json(customers);
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function POST(req: Request) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        include: { role: true }
    });

    if (!dbUser) {
        return new NextResponse("Forbidden", { status: 403 });
    }

    // Permission check
    const allowedRoles = ['ADMIN', 'RECEPCAO', 'GERENTE'];
    if (!allowedRoles.includes(dbUser.role.name)) {
        return new NextResponse("Forbidden", { status: 403 });
    }

    try {
        const body = await req.json();
        const { name, document, phone, email, address } = body;

        // Simple validation
        if (!name) return new NextResponse("Name is required", { status: 400 });

        const customer = await prisma.customer.create({
            data: {
                name,
                document,
                phone,
                email,
                address,
                vehicles: body.vehicle ? {
                    create: {
                        plate: body.vehicle.plate,
                        brand: body.vehicle.brand,
                        model: body.vehicle.model,
                        color: body.vehicle.color,
                        year: Number(body.vehicle.year) || undefined
                    }
                } : undefined
            }
        });

        return NextResponse.json(customer);
    } catch (error) {
        console.error(error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
