"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";



export async function submitLead(data: any) {
    try {
        const {
            nome,
            email,
            telefone,
            instagram,
            ramo,
            faturamento,
            investimento,
            objetivo,
            faz_trafego,
        } = data;

        // AI Qualification
        const aiResult = await qualifyWithAI(data);

        const faturamentoCategoria = aiResult.faturamento_categoria || faturamento;
        const investCategoria = aiResult.invest_categoria || investimento;
        const tagsAi = JSON.stringify(aiResult.tags_ai || []);
        const scorePotencial = aiResult.score_potencial || 0;
        const urgencia = aiResult.urgencia || "baixa";
        const resumoAi = aiResult.resumo || "";

        // Determine Kanban Status
        let statusKanban = "cold";
        if (faturamentoCategoria === "200k+") statusKanban = "ultra_hot";
        else if (faturamentoCategoria === "50-200k") statusKanban = "hot";
        else if (faturamentoCategoria === "10-50k") statusKanban = "warm";

        const lead = await prisma.lead.create({
            data: {
                nome,
                email,
                telefone,
                instagram,
                ramo,
                faturamentoRaw: faturamento,
                faturamentoCategoria,
                investRaw: investimento,
                investCategoria,
                objetivo,
                fazTrafego: faz_trafego,
                tagsAi,
                scorePotencial,
                urgencia,
                resumoAi,
                statusKanban,
            },
        });

        revalidatePath("/dashboard/crm");
        return { success: true, id: lead.id };
    } catch (error) {
        console.error("Error submitting lead:", error);
        return { success: false, error: "Falha ao processar lead." };
    }
}

export async function updateLeadStatus(id: string, status: string) {
    try {
        console.log(`[CRM] Updating lead ${id} to status ${status}`);
        await prisma.lead.update({
            where: { id },
            data: { statusKanban: status },
        });
        revalidatePath("/dashboard/crm");
        return { success: true };
    } catch (error) {
        console.error("Error updating lead status:", error);
        return { success: false };
    }
}

export async function reanalyzeLead(id: string) {
    try {
        const lead = await prisma.lead.findUnique({ where: { id } });
        if (!lead) return { success: false, error: "Lead não encontrado." };

        const aiResult = await qualifyWithAI({
            nome: lead.nome,
            email: lead.email,
            faturamento: lead.faturamentoRaw,
            investimento: lead.investRaw,
            ramo: lead.ramo,
            objetivo: lead.objetivo,
            faz_trafego: lead.fazTrafego,
        });

        await prisma.lead.update({
            where: { id },
            data: {
                faturamentoCategoria: aiResult.faturamento_categoria,
                investCategoria: aiResult.invest_categoria,
                tagsAi: JSON.stringify(aiResult.tags_ai),
                scorePotencial: aiResult.score_potencial,
                urgencia: aiResult.urgencia,
                resumoAi: aiResult.resumo,
            },
        });

        revalidatePath("/dashboard/crm");
        revalidatePath(`/dashboard/crm/${id}`);
        return { success: true };
    } catch (error) {
        console.error("Error reanalyzing lead:", error);
        return { success: false };
    }
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function qualifyWithAI(data: any): Promise<any> {
    if (!GEMINI_API_KEY) {
        return {
            faturamento_categoria: data.faturamento || "0-10k",
            invest_categoria: "3k",
            tags_ai: ["API Key ausente", "Lead Manual"],
            score_potencial: 50,
            urgencia: "média",
            resumo: "Configure a GEMINI_API_KEY no arquivo .env para qualificação real.",
        };
    }

    const prompt = `Você é um assistente de qualificação de leads para uma agência de tráfego pago. Receba as respostas abaixo e devolva um JSON contendo: faturamento_categoria (0-10k, 10-50k, 50-200k, 200k+), invest_categoria (1k, 3k, 5k, 10k, 10k+), tags_ai = lista com insights do lead, score_potencial (0-100), urgencia (baixa, média, alta), resumo = descrição curta do potencial do lead. Responda apenas com JSON puro. Respostas: ${JSON.stringify(
        data
    )}`;

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemma-3-27b-it:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                }),
            }
        );

        const result = await response.json();
        const text = result.candidates[0].content.parts[0].text;
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
    } catch (error) {
        console.error("AI Qualification failed:", error);
    }

    return {};
}

export async function deleteLead(id: string) {
    try {
        await prisma.lead.delete({ where: { id } });
        revalidatePath("/dashboard/crm");
        return { success: true };
    } catch (error) {
        console.error("Error deleting lead:", error);
        return { success: false, error: "Falha ao excluir lead." };
    }
}
