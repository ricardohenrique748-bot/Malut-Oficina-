"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, ShoppingCart, Calendar, User, Printer, FileText, CheckCircle, Mail, MessageCircle, Share2, Edit, Trash2, Loader2, Barcode } from "lucide-react";
import { format } from "date-fns";
import { emitBlingInvoiceByOS, generateBlingBoletoByOS } from "../../financial/actions";

const STATUS_LABELS: Record<string, string> = {
    'ORCAMENTO': 'Orçamento',
    'FINALIZADA': 'Venda Finalizada'
};

const STATUS_COLORS: Record<string, string> = {
    'ORCAMENTO': 'bg-blue-100 text-blue-800',
    'FINALIZADA': 'bg-green-100 text-green-800'
};

export default function SalesHistoryPage() {
    const [sales, setSales] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [emittingId, setEmittingId] = useState<string | null>(null);
    const [emittingBoletoId, setEmittingBoletoId] = useState<string | null>(null);

    const fetchSales = async () => {
        setLoading(true);
        fetch('/api/work-orders')
            .then(res => res.json())
            .then(data => {
                const pdvSales = data.filter((os: any) => !os.vehicle);
                setSales(pdvSales);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchSales();
    }, []);

    const handleFinalize = async (id: string, currentlyClosed: boolean) => {
        if (currentlyClosed) return;
        if (!confirm("Deseja transformar este orçamento em Venda Finalizada? Isso lançará o financeiro.")) return;

        try {
            const res = await fetch(`/api/work-orders/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newStatus: 'FINALIZADA' })
            });

            if (res.ok) {
                alert("Venda finalizada com sucesso!");
                fetchSales();
            } else {
                alert("Erro ao finalizar venda.");
            }
        } catch (error) {
            console.error(error);
            alert("Erro ao conectar com servidor.");
        }
    };

    const handleWhatsApp = (sale: any) => {
        if (!sale.customer.phone) {
            alert("Este cliente não possui telefone cadastrado.");
            return;
        }

        const pdfLink = `${window.location.origin}/dashboard/work-orders/${sale.id}/print`;
        const message = `Olá *${sale.customer.name}*, tudo bem?\n\nAqui é da *Malut Comercio*.\nSegue o link para visualizar seu pedido *#${sale.code}* (R$ ${Number(sale.totalValue).toFixed(2)}):\n\n${pdfLink}`;
        const url = `https://wa.me/55${sale.customer.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    const handleEmail = (sale: any) => {
        const subject = `Proposta Comercial #${sale.code} - Malut Comercio`;
        const body = `Olá ${sale.customer.name},\n\nSegue em anexo a proposta #${sale.code} no valor de R$ ${Number(sale.totalValue).toFixed(2)}.\n\nAtenciosamente,\nMalut Comercio`;
        window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
    };

    const handleEmitNote = async (sale: any) => {
        if (!confirm(`Deseja emitir Nota Fiscal no Bling para a Venda #${sale.code}?`)) return;

        setEmittingId(sale.id);
        try {
            const result = await emitBlingInvoiceByOS(sale.id);
            alert(result.message);
        } catch (error) {
            alert("Erro ao conectar com Bling. Verifique as configurações de integração.");
        } finally {
            setEmittingId(null);
        }
    };

    const handleEmitBoleto = async (sale: any) => {
        if (!confirm(`Deseja gerar Boleto no Bling para a Venda #${sale.code}?`)) return;

        setEmittingBoletoId(sale.id);
        try {
            const result = await generateBlingBoletoByOS(sale.id);
            alert(result.message);
        } catch (error) {
            alert("Erro ao conectar com Bling. Verifique as configurações de integração.");
        } finally {
            setEmittingBoletoId(null);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir esta proposta permanentemente?")) return;

        try {
            const res = await fetch(`/api/work-orders/${id}`, { method: 'DELETE' });
            if (res.ok) {
                alert("Proposta excluída com sucesso.");
                fetchSales();
            } else {
                const error = await res.text();
                alert(`Erro ao excluir: ${error || 'Verifique se você tem permissão'}`);
            }
        } catch (error) {
            console.error(error);
            alert("Erro ao conectar com servidor.");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
                        <ShoppingCart className="h-8 w-8 text-indigo-600" />
                        Histórico de Vendas
                    </h1>
                    <p className="text-gray-500">Listagem de orçamentos e vendas de balcão (sem veículo).</p>
                </div>
                <Link
                    href="/dashboard/pdv"
                    className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-indigo-700 transition"
                >
                    Nova Venda / Proposta
                </Link>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <div>Carregando...</div>
                ) : sales.length === 0 ? (
                    <div className="text-center py-10 bg-white dark:bg-gray-800 rounded shadow text-gray-500 dark:text-gray-400">
                        Nenhuma venda ou proposta encontrada.
                    </div>
                ) : (
                    sales.map((sale) => (
                        <div
                            key={sale.id}
                            className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4 flex flex-col sm:flex-row gap-4 justify-between items-center"
                        >
                            <div className="flex items-start gap-4 flex-1">
                                <div className="p-3 bg-indigo-50 dark:bg-gray-700 rounded-lg hidden sm:block">
                                    <FileText className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Proposta #{sale.code}</h3>
                                        <span className={`px-2 py-0.5 text-xs font-bold rounded ${STATUS_COLORS[sale.status] || 'bg-gray-100'}`}>
                                            {STATUS_LABELS[sale.status] || sale.status}
                                        </span>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-4 text-sm text-gray-500 dark:text-gray-400">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {format(new Date(sale.createdAt), "dd/MM/yyyy HH:mm")}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <User className="h-3 w-3" />
                                            {sale.customer.name}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto sm:justify-end">
                                <div className="text-right hidden sm:block">
                                    <div className="text-xs text-gray-500 dark:text-gray-400">Valor Total</div>
                                    <div className="text-lg font-bold text-green-600 dark:text-green-400">
                                        R$ {Number(sale.totalValue).toFixed(2)}
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    {/* Share Actions */}
                                    <button
                                        onClick={() => handleWhatsApp(sale)}
                                        className={`p-2 rounded ${sale.customer.phone ? 'text-green-600 hover:bg-green-50' : 'text-gray-300 cursor-not-allowed'}`}
                                        title={sale.customer.phone ? "Enviar no WhatsApp" : "Cliente sem telefone"}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                        </svg>
                                    </button>

                                    <button
                                        onClick={() => handleEmail(sale)}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                                        title="Enviar por Email"
                                    >
                                        <Mail size={20} />
                                    </button>

                                    {/* Actions */}
                                    {sale.status !== 'FINALIZADA' ? (
                                        <button
                                            onClick={() => handleFinalize(sale.id, false)}
                                            className="p-2 text-green-600 hover:bg-green-50 rounded border border-green-200"
                                            title="Finalizar Venda"
                                        >
                                            <CheckCircle size={20} />
                                        </button>
                                    ) : (
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => handleEmitNote(sale)}
                                                disabled={emittingId === sale.id}
                                                className="p-2 text-amber-600 hover:bg-amber-50 rounded border border-amber-200 disabled:opacity-50"
                                                title="Emitir NF-e (Bling)"
                                            >
                                                {emittingId === sale.id ? <Loader2 size={18} className="animate-spin" /> : <FileText size={20} />}
                                            </button>
                                            <button
                                                onClick={() => handleEmitBoleto(sale)}
                                                disabled={emittingBoletoId === sale.id}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded border border-blue-200 disabled:opacity-50"
                                                title="Gerar Boleto (Bling)"
                                            >
                                                {emittingBoletoId === sale.id ? <Loader2 size={18} className="animate-spin" /> : <Barcode size={20} />}
                                            </button>
                                        </div>
                                    )}

                                    {/* Edit/Delete Actions */}
                                    <Link
                                        href={`/dashboard/work-orders/${sale.id}`}
                                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded"
                                        title="Editar / Ver Detalhes"
                                    >
                                        <Edit size={20} />
                                    </Link>

                                    <button
                                        onClick={() => handleDelete(sale.id)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                                        title="Excluir Proposta"
                                    >
                                        <Trash2 size={20} />
                                    </button>

                                    <Link
                                        href={`/dashboard/work-orders/${sale.id}/print`}
                                        target="_blank"
                                        className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                        title="Imprimir"
                                    >
                                        <Printer className="h-5 w-5" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
