import { createClient } from "./supabase-server";
import { prisma } from "./prisma";
import { NextResponse } from "next/server";
import { cache } from "react";

export const getAuthUser = cache(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        include: { role: true }
    });

    if (!dbUser) return null;

    // Convert Decimals to Numbers for serialization to Client Components
    return {
        ...dbUser,
        commissionRate: dbUser.commissionRate ? Number(dbUser.commissionRate) : 0,
    } as any;
});

export async function authorize(allowedRoles: string[]) {
    const user = await getAuthUser();

    if (!user) {
        return { error: new NextResponse("Unauthorized", { status: 401 }), user: null };
    }

    if (!allowedRoles.includes(user.role.name)) {
        return { error: new NextResponse("Forbidden", { status: 403 }), user };
    }

    return { error: null, user };
}
