'use server'

import { prisma } from "@/lib/prisma";
import { authorize } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";

export async function deleteUser(userId: string) {
    const { error } = await authorize(['ADMIN']);
    if (error) {
        return { success: false, message: "Não autorizado" };
    }

    try {
        await prisma.user.delete({
            where: { id: userId }
        });

        revalidatePath('/dashboard/staff');
        return { success: true };
    } catch (error) {
        console.error("Error deleting user:", error);
        return { success: false, message: "Erro ao excluir usuário" };
    }
}
