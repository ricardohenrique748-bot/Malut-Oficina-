import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-utils";

export async function GET(req: Request) {
    const user = await getAuthUser();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    try {
        const services = await prisma.serviceCatalog.findMany({
            orderBy: { name: 'asc' },
            take: 100
        });
        return NextResponse.json(services);
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}
