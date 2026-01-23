"use server";

import { prisma } from "@/lib/prisma";
import { BlingService } from "@/lib/bling";
import { revalidatePath } from "next/cache";
import { authorize } from "@/lib/auth-utils";

export async function getBlingSyncInfo() {
    const { error } = await authorize(['ADMIN', 'GERENTE']);
    if (error) return { success: false, message: "Não autorizado" };

    try {
        const response = await BlingService.getProducts(1, 100);
        const products = response.data || [];
        const hasMore = products.length === 100;

        // Try to get actual metadata from Bling V3 response
        const totalPages = response.meta?.paginas || response.meta?.pages || (hasMore ? 10 : 1);
        const totalProducts = response.meta?.total || products.length;

        return {
            success: true,
            totalPages,
            totalProducts,
            firstPage: products
        };
    } catch (e: any) {
        console.error('[Bling Sync] Error getting sync info:', e);
        return { success: false, message: e.message || 'Erro ao conectar com Bling. Verifique se a integração está autorizada.' };
    }
}

export async function syncBlingPage(page: number) {
    const { error } = await authorize(['ADMIN', 'GERENTE']);
    if (error) return { success: false, message: "Não autorizado" };

    try {
        console.log(`[Bling Sync] Fetching page ${page}...`);
        const response = await BlingService.getProducts(page, 100);
        const products = response.data || [];
        console.log(`[Bling Sync] Got ${products.length} products from page ${page}`);

        let createdCount = 0;
        let updatedCount = 0;

        for (const item of products) {
            const sku = item.codigo?.toString().trim() || "";
            const name = item.nome?.toString().trim() || "Produto sem nome";
            const price = parseFloat(item.preco) || 0;
            const stock = parseFloat(item.estoque?.saldoVirtualTotal || item.estoque?.quantidade || 0);

            let existing = null;
            if (sku) {
                existing = await prisma.part.findUnique({ where: { sku } });
            }

            if (!existing) {
                existing = await prisma.part.findFirst({ where: { name } });
            }

            if (existing) {
                const dataToUpdate: any = { price, stockQuantity: stock };
                if (!existing.sku && sku) dataToUpdate.sku = sku;

                await prisma.part.update({
                    where: { id: existing.id },
                    data: dataToUpdate
                });
                updatedCount++;
            } else {
                await prisma.part.create({
                    data: {
                        name,
                        sku: sku || null,
                        price,
                        stockQuantity: stock,
                        costPrice: 0
                    }
                });
                createdCount++;
            }
        }

        console.log(`[Bling Sync] Page ${page} complete: ${createdCount} created, ${updatedCount} updated`);
        revalidatePath("/dashboard/inventory");
        return {
            success: true,
            createdCount,
            updatedCount,
            processed: products.length,
            hasMore: products.length === 100
        };
    } catch (e: any) {
        console.error(`[Bling Sync] Error on page ${page}:`, e);
        return { success: false, message: e.message || 'Erro ao sincronizar. Verifique se a integração está autorizada.' };
    }
}

export async function syncItemsWithBling() {
    // For backward compatibility or single-page simplified sync
    const info: any = await getBlingSyncInfo();
    if (!info.success) return info;
    return syncBlingPage(1);
}
