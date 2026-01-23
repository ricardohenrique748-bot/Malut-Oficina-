import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorize } from "@/lib/auth-utils";

export async function GET(req: Request) {
    const { error } = await authorize(['ADMIN', 'RECEPCAO', 'MECANICO', 'GERENTE']);
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");

    try {
        const parts = await prisma.part.findMany({
            where: search ? {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { sku: { contains: search, mode: 'insensitive' } }
                ]
            } : undefined,
            orderBy: { name: 'asc' }
        });
        return NextResponse.json(parts);
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function POST(req: Request) {
    const { error } = await authorize(['ADMIN', 'GERENTE']);
    if (error) return error;

    try {
        const body = await req.json();
        const { name, sku, price, costPrice, stockQuantity, minStock } = body;

        const part = await prisma.part.create({
            data: {
                name,
                sku,
                price: Number(price),
                costPrice: Number(costPrice) || 0,
                stockQuantity: Number(stockQuantity) || 0,
                minStock: Number(minStock) || 0
            }
        });

        // Create initial movement
        if (Number(stockQuantity) > 0) {
            await prisma.stockMovement.create({
                data: {
                    partId: part.id,
                    type: 'IN',
                    quantity: Number(stockQuantity),
                    referenceId: 'INITIAL_STOCK'
                }
            });
        }

        return NextResponse.json(part);
    } catch (error) {
        console.error(error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
