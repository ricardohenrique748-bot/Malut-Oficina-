import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorize } from "@/lib/auth-utils";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

export async function GET(req: Request) {
    // Only ADMINs can manage staff
    const { error } = await authorize(['ADMIN']);
    if (error) return error;

    try {
        const users = await prisma.user.findMany({
            include: { role: true },
            orderBy: { name: 'asc' }
        });

        const roles = await prisma.role.findMany();

        return NextResponse.json({ users, roles });
    } catch (error) {
        console.error(error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function POST(req: Request) {
    const { error } = await authorize(['ADMIN']);
    if (error) return error;

    try {
        const body = await req.json();
        const { id, name, email, password, roleId, commissionRate, active } = body;

        if (id) {
            // Update existing
            const updateData: any = {
                name,
                email,
                roleId,
                commissionRate: Number(commissionRate) || 0,
                active: active !== undefined ? active : true
            };

            if (password) {
                updateData.passwordHash = await bcrypt.hash(password, 10);
            }

            const user = await prisma.user.update({
                where: { id },
                data: updateData
            });
            return NextResponse.json(user);
        } else {
            // Check if email already exists
            const existingUser = await prisma.user.findUnique({
                where: { email }
            });

            if (existingUser) {
                return new NextResponse("Este e-mail já está cadastrado no sistema.", { status: 400 });
            }

            // Create new - use UUID (guaranteed to be unique and compatible)
            const passwordHash = await bcrypt.hash(password || "123456", 10);
            const newId = randomUUID();

            const user = await prisma.user.create({
                data: {
                    id: newId,
                    name,
                    email,
                    passwordHash,
                    roleId,
                    commissionRate: Number(commissionRate) || 0,
                    active: true
                }
            });
            return NextResponse.json(user);
        }
    } catch (error: any) {
        console.error("STAFF ERROR:", error);

        // Check for unique constraint violation
        if (error.code === 'P2002') {
            return new NextResponse("Este e-mail já está cadastrado no sistema.", { status: 400 });
        }

        return new NextResponse(`Erro ao salvar: ${error.message}`, { status: 500 });
    }
}
