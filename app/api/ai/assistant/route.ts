import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function POST(req: Request) {
    if (!GEMINI_API_KEY) {
        return NextResponse.json({
            text: "⚠️ Erro de Configuração: API Key do Gemini não encontrada."
        });
    }

    try {
        const { message, history } = await req.json();

        // 1. Fetch Real-time Context (Statistics)
        const [
            totalLeads,
            leadsByStatus,
            totalWorkOrders,
            woByStatus,
            totalCustomers
        ] = await Promise.all([
            prisma.lead.count(),
            prisma.lead.groupBy({ by: ['statusKanban'], _count: true }),
            prisma.workOrder.count(),
            prisma.workOrder.groupBy({ by: ['status'], _count: true }),
            prisma.customer.count()
        ]);

        const statsContext = `
DADOS REAIS DO SISTEMA AGORA:
- Total de Leads: ${totalLeads}
- Leads por Status: ${leadsByStatus.map(s => `${s.statusKanban}: ${s._count}`).join(', ')}
- Total de OS (Ordens de Serviço): ${totalWorkOrders}
- OS por Status: ${woByStatus.map(s => `${s.status}: ${s._count}`).join(', ')}
- Total de Clientes: ${totalCustomers}
`;

        // Construct the context/persona for Gemini
        const systemPrompt = `
Você é a 'Pipinha', assistente da 'Malut Oficina'.
Dados Reais: ${statsContext}
Instruções: Utilize os dados acima. Seja EXTREMAMENTE concisa e direta. Responda em no máximo 2 frases.
Histórico: ${history ? history.map((h: any) => `${h.role === 'user' ? 'U' : 'IA'}: ${h.text}`).join('\n') : ''}
U: ${message}
IA:`;

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemma-3-4b-it:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: systemPrompt }] }],
                    generationConfig: {
                        maxOutputTokens: 150,
                        temperature: 0.1
                    }
                }),
            }
        );

        const data = await response.json();

        if (!data.candidates || data.candidates.length === 0) {
            console.error("Gemini API Error:", data);
            return NextResponse.json({
                error: "Gemini API Error",
                details: data.error?.message || JSON.stringify(data)
            }, { status: 500 });
        }

        const aiMessage = data.candidates[0].content.parts[0].text;

        return NextResponse.json({ text: aiMessage });

    } catch (error: any) {
        console.error("Gemini Assistant Error:", error);
        return NextResponse.json({
            error: "Internal Error",
            details: error.message
        }, { status: 500 });
    }
}
