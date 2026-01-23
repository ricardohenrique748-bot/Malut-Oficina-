
"use server";

import { prisma } from "@/lib/prisma";
import { BlingService } from "@/lib/bling";
import { revalidatePath } from "next/cache";

export async function emitBlingInvoice(recordId: string) {
    try {
        const record = await prisma.financialRecord.findUnique({
            where: { id: recordId },
            include: {
                workOrder: {
                    include: {
                        customer: true,
                        items: true
                    }
                }
            }
        });

        if (!record || !record.workOrder) {
            throw new Error("Lançamento não possui uma Ordem de Serviço vinculada.");
        }

        return await processBlingEmission(record.workOrder);
    } catch (error: any) {
        console.error("Invoice Error:", error);
        return { success: false, message: error.message || "Erro ao emitir nota no Bling." };
    }
}

export async function emitBlingInvoiceByOS(osId: string) {
    try {
        const os = await prisma.workOrder.findUnique({
            where: { id: osId },
            include: {
                customer: true,
                items: true
            }
        });

        if (!os) throw new Error("Ordem de serviço não encontrada.");
        if (os.status !== 'FINALIZADA' && os.status !== 'ENTREGUE') {
            throw new Error("Apenas vendas finalizadas podem emitir nota fiscal.");
        }

        return await processBlingEmission(os);
    } catch (error: any) {
        console.error("Invoice Error:", error);
        return { success: false, message: error.message || "Erro ao emitir nota no Bling." };
    }
}

export async function generateBlingBoletoByOS(osId: string) {
    try {
        const os = await prisma.workOrder.findUnique({
            where: { id: osId },
            include: {
                customer: true,
                items: true
            }
        });

        if (!os) throw new Error("Ordem de serviço não encontrada.");
        if (os.status !== 'FINALIZADA' && os.status !== 'ENTREGUE') {
            throw new Error("Apenas vendas finalizadas podem gerar boleto.");
        }

        const customer = os.customer;
        const blingOrder = {
            contato: {
                nome: customer.name,
                numeroDocumento: customer.document || "",
                fone: customer.phone || "",
                email: customer.email || "",
            },
            itens: os.items.map((item: any) => ({
                codigo: item.catalogItemId || "",
                descricao: item.name,
                quantidade: Number(item.quantity),
                valor: Number(item.unitPrice),
                unidade: "un"
            })),
            outroBruto: 0,
            desconto: Number(os.discount || 0),
        };

        // 1. Create Order in Bling
        const orderResponse = await BlingService.createOrder(blingOrder);
        const blingOrderId = orderResponse.data.id;

        revalidatePath("/dashboard/financial");
        revalidatePath("/dashboard/pdv/history");
        revalidatePath(`/dashboard/work-orders/${os.id}`);

        return {
            success: true,
            message: `Pedido #${blingOrderId} enviado ao Bling. Você pode gerar o boleto diretamente no painel do Bling agora.`
        };
    } catch (error: any) {
        console.error("Boleto Error:", error);
        return { success: false, message: error.message || "Erro ao preparar boleto no Bling." };
    }
}

async function processBlingEmission(os: any) {
    const customer = os.customer;

    // Map local OS to Bling Order structure
    const blingOrder = {
        contato: {
            nome: customer.name,
            numeroDocumento: customer.document || "",
            fone: customer.phone || "",
            email: customer.email || "",
        },
        itens: os.items.map((item: any) => ({
            codigo: item.catalogItemId || "",
            descricao: item.name,
            quantidade: Number(item.quantity),
            valor: Number(item.unitPrice),
            unidade: "un"
        })),
        outroBruto: 0,
        desconto: Number(os.discount || 0),
    };

    // 1. Create Order in Bling
    const orderResponse = await BlingService.createOrder(blingOrder);
    const blingOrderId = orderResponse.data.id;

    // 2. Trigger Invoice Generation
    await BlingService.emitInvoice(blingOrderId);

    revalidatePath("/dashboard/financial");
    revalidatePath("/dashboard/pdv/history");
    revalidatePath(`/dashboard/work-orders/${os.id}`);

    return {
        success: true,
        message: `Nota enviada para o Bling com sucesso (Pedido #${blingOrderId}). Verifique o painel do Bling para concluir a emissão.`
    };
}
