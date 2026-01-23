import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorize } from "@/lib/auth-utils";

export async function GET(req: Request, { params }: { params: { id: string } }) {
    const { error } = await authorize(['ADMIN', 'RECEPCAO', 'MECANICO', 'GERENTE']);
    if (error) return error;

    try {
        const movements = await prisma.stockMovement.findMany({
            where: { partId: params.id },
            orderBy: { createdAt: 'desc' }
        });

        // Resolve references to be more human-readable
        const enhancedMovements = await Promise.all(movements.map(async (mov) => {
            let label = mov.referenceId || "N/A";

            // If it's a UUID (probably legacy referenceId)
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if (mov.referenceId && uuidRegex.test(mov.referenceId)) {
                const os = await prisma.workOrder.findUnique({
                    where: { id: mov.referenceId },
                    select: { code: true }
                });
                if (os) label = `OS #${os.code}`;
            }

            return {
                ...mov,
                referenceLabel: label
            };
        }));

        return NextResponse.json(enhancedMovements);
    } catch (error) {
        console.error(error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
