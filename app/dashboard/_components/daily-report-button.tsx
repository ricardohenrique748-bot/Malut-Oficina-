"use client";

import { useState } from "react";
import { MessageSquare, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function DailyReportButton() {
    const [loading, setLoading] = useState(false);

    const generateAndSend = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/reports/daily");
            if (!res.ok) throw new Error("Falha ao gerar relatório");
            const data = await res.json();

            const dateStr = format(new Date(), "dd/MM/yyyy", { locale: ptBR });

            // Format message exactly as the print
            const message = `Olá! 👋

Estou passando para te passar alguns indicadores referente a movimentação do dia ${dateStr}. 😁

---------------------------------------
💰 Faturamento: ${data.faturamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
🔴 Desconto Concedido: ${data.desconto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
💰 Faturamento Líquido: ${data.faturamentoLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
🟡 Impostos (*): ${data.impostos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
🟡 Custo Mercadoria Vendida: ${data.cmv.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
💵 Valor Lucro Líquido: ${data.lucroLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
💵 Percentual Lucro Líquido: ${data.percentualLucro.toFixed(2)}%
---------------------------------------
---------------------------------------
👨‍🔧 Quantidade de OS's Abertas: ${data.osAbertas},00
💰 Ticket Médio: ${data.ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
---------------------------------------

(*) Impostos calculados sobre 5% do faturamento líquido.`;

            const encodedMessage = encodeURIComponent(message);
            // Using generic wa.me to let user choose recipient or we could ask for a default number
            window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');

        } catch (error) {
            console.error(error);
            alert("Erro ao gerar relatório diário. Verifique se há vendas finalizadas hoje.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={generateAndSend}
            disabled={loading}
            className="flex items-center gap-2 bg-[#25D366] text-white px-4 py-2 rounded-lg shadow-lg hover:bg-[#128C7E] transition-all font-semibold disabled:opacity-50"
        >
            {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <MessageSquare className="h-4 w-4" />
            )}
            Relatório WhatsApp
        </button>
    );
}
