"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { format } from "date-fns";

interface WorkOrder {
    id: string;
    code: number;
    customer: { name: string; document: string; phone: string; email: string; address: string };
    vehicle: { plate: string; brand: string; model: string; year: number; color: string } | null;
    items: any[];
    totalParts: string;
    totalLabor: string;
    totalValue: string;
    discount: string;
    createdAt: string;
    notes: string;
    status: string;
    responsible?: { name: string };
    seller?: { name: string };
}

const STATUS_LABELS: Record<string, string> = {
    'ABERTA': 'Aberta',
    'DIAGNOSTICO': 'Em Diagnóstico',
    'ORCAMENTO': 'Orçamento',
    'AGUARDANDO_APROVACAO': 'Aguardando Aprovação',
    'APROVADA': 'Aprovada',
    'EM_EXECUCAO': 'Em Execução',
    'TESTE_QUALIDADE': 'Teste de Qualidade',
    'FINALIZADA': 'Finalizada',
    'ENTREGUE': 'Entregue',
    'GARANTIA': 'Garantia'
};

export default function PrintWorkOrderPage() {
    const params = useParams();
    const [os, setOs] = useState<WorkOrder | null>(null);

    useEffect(() => {
        fetch(`/api/work-orders/${params.id}`)
            .then(res => res.json())
            .then(data => {
                setOs(data);
                // Auto-print when loaded
                setTimeout(() => window.print(), 500);
            });
    }, [params.id]);

    if (!os) return <div className="p-8 text-center">Carregando documento...</div>;

    return (
        <>
            <style jsx global>{`
                @media print {
                    body { margin: 0; padding: 0; }
                    @page { margin: 1cm; }
                }
            `}</style>

            <div className="bg-white p-8 max-w-[210mm] mx-auto text-black print:max-w-none">
                {/* Header */}
                <div className="text-center border-b-2 border-gray-800 pb-6 mb-6">
                    <div className="flex justify-center mb-3">
                        <div className="w-20 h-20 bg-indigo-600 rounded-2xl flex items-center justify-center">
                            <span className="text-white text-4xl font-black">M</span>
                        </div>
                    </div>
                    <h1 className="text-3xl font-black uppercase tracking-tight mb-2">Ordem de Serviço</h1>
                    <p className="text-base font-bold text-gray-700">Malut Comércio - Soluções Automotivas</p>
                    <p className="text-sm text-gray-600">Rua da Oficina, 123 - Centro | Tel: (11) 99999-9999</p>
                    <p className="text-sm text-gray-600">CNPJ: 00.000.000/0001-00 | Email: contato@malut.com.br</p>
                </div>

                {/* OS Number and Status */}
                <div className="flex justify-between items-center mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-bold">Número da OS</p>
                        <p className="text-3xl font-black text-gray-900">#{os.code}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-500 uppercase font-bold mb-1">Status</p>
                        <span className="inline-block px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg">
                            {STATUS_LABELS[os.status] || os.status}
                        </span>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-500 uppercase font-bold">Data de Abertura</p>
                        <p className="text-lg font-bold text-gray-900">{format(new Date(os.createdAt), "dd/MM/yyyy")}</p>
                    </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                    {/* Cliente */}
                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <h3 className="font-black text-sm uppercase mb-3 text-gray-700 border-b border-gray-300 pb-2">📋 Cliente</h3>
                        <div className="space-y-1.5 text-sm">
                            <p><span className="font-bold text-gray-600">Nome:</span> {os.customer.name}</p>
                            <p><span className="font-bold text-gray-600">CPF/CNPJ:</span> {os.customer.document || "Não informado"}</p>
                            <p><span className="font-bold text-gray-600">Telefone:</span> {os.customer.phone || "Não informado"}</p>
                            {os.customer.email && <p><span className="font-bold text-gray-600">Email:</span> {os.customer.email}</p>}
                            {os.customer.address && <p><span className="font-bold text-gray-600">Endereço:</span> {os.customer.address}</p>}
                        </div>
                    </div>

                    {/* Veículo */}
                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <h3 className="font-black text-sm uppercase mb-3 text-gray-700 border-b border-gray-300 pb-2">🚗 Veículo</h3>
                        {os.vehicle ? (
                            <div className="space-y-1.5 text-sm">
                                <p><span className="font-bold text-gray-600">Modelo:</span> {os.vehicle.brand} {os.vehicle.model}</p>
                                <p><span className="font-bold text-gray-600">Placa:</span> {os.vehicle.plate}</p>
                                <p><span className="font-bold text-gray-600">Ano:</span> {os.vehicle.year} <span className="ml-3 font-bold text-gray-600">Cor:</span> {os.vehicle.color}</p>
                            </div>
                        ) : (
                            <p className="italic text-gray-500 text-sm">Sem veículo vinculado (Venda de balcão)</p>
                        )}

                        {/* Responsible & Seller */}
                        <div className="mt-4 pt-3 border-t border-gray-300 space-y-1.5 text-sm">
                            {os.responsible && <p><span className="font-bold text-gray-600">Mecânico:</span> {os.responsible.name}</p>}
                            {os.seller && <p><span className="font-bold text-gray-600">Vendedor:</span> {os.seller.name}</p>}
                        </div>
                    </div>
                </div>

                {/* Items Table */}
                <div className="mb-6">
                    <h3 className="font-black text-sm uppercase mb-3 text-gray-700 bg-gray-100 p-3 rounded-t-lg border border-gray-200">
                        🔧 Peças e Serviços
                    </h3>
                    <table className="w-full text-sm border border-gray-200">
                        <thead>
                            <tr className="bg-gray-50 border-b-2 border-gray-300">
                                <th className="text-left py-3 px-4 font-bold text-gray-700">Tipo</th>
                                <th className="text-left py-3 px-4 font-bold text-gray-700">Descrição</th>
                                <th className="text-center py-3 px-4 font-bold text-gray-700 w-20">Qtd</th>
                                <th className="text-right py-3 px-4 font-bold text-gray-700 w-28">Valor Unit.</th>
                                <th className="text-right py-3 px-4 font-bold text-gray-700 w-28">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {os.items.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-8 text-gray-400 italic">
                                        Nenhum item adicionado
                                    </td>
                                </tr>
                            ) : (
                                os.items.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50">
                                        <td className="py-2.5 px-4">
                                            <span className={`text-xs font-bold px-2 py-1 rounded ${item.type === 'SERVICE'
                                                    ? 'bg-blue-100 text-blue-700'
                                                    : 'bg-orange-100 text-orange-700'
                                                }`}>
                                                {item.type === 'SERVICE' ? 'Serviço' : 'Peça'}
                                            </span>
                                        </td>
                                        <td className="py-2.5 px-4 font-medium">{item.name}</td>
                                        <td className="text-center py-2.5 px-4">{Number(item.quantity)}</td>
                                        <td className="text-right py-2.5 px-4 font-mono">R$ {Number(item.unitPrice).toFixed(2)}</td>
                                        <td className="text-right py-2.5 px-4 font-mono font-bold">R$ {Number(item.total).toFixed(2)}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Totals */}
                <div className="flex justify-end mb-8">
                    <div className="w-80 border border-gray-300 rounded-lg overflow-hidden">
                        <div className="bg-gray-50 p-3 border-b border-gray-300">
                            <h3 className="font-black text-sm uppercase text-gray-700">💰 Resumo Financeiro</h3>
                        </div>
                        <div className="p-4 space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Peças:</span>
                                <span className="font-mono font-bold">R$ {Number(os.totalParts).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Serviços:</span>
                                <span className="font-mono font-bold">R$ {Number(os.totalLabor).toFixed(2)}</span>
                            </div>
                            {Number(os.discount) > 0 && (
                                <div className="flex justify-between text-red-600">
                                    <span>Desconto:</span>
                                    <span className="font-mono font-bold">- R$ {Number(os.discount).toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between border-t-2 border-gray-800 pt-2 mt-2">
                                <span className="font-black text-base uppercase">Total:</span>
                                <span className="font-mono font-black text-xl text-indigo-600">R$ {Number(os.totalValue).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Notes */}
                {os.notes && (
                    <div className="mb-8 border-2 border-gray-300 rounded-lg p-4 bg-yellow-50">
                        <h3 className="font-black text-sm uppercase mb-2 text-gray-700">📝 Observações / Diagnóstico Técnico</h3>
                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800">{os.notes}</p>
                    </div>
                )}

                {/* Terms */}
                <div className="mb-8 border border-gray-200 rounded-lg p-4 bg-gray-50 text-xs text-gray-600">
                    <h4 className="font-bold mb-2 text-gray-700">Termos e Condições:</h4>
                    <ul className="list-disc list-inside space-y-1">
                        <li>Garantia de 90 dias para serviços e peças originais</li>
                        <li>Peças substituídas ficam à disposição do cliente por 30 dias</li>
                        <li>Valores sujeitos a alteração mediante aprovação prévia</li>
                        <li>Veículo não retirado em 30 dias estará sujeito a taxa de estadia</li>
                    </ul>
                </div>

                {/* Signatures */}
                <div className="grid grid-cols-2 gap-16 mt-12 text-center text-sm">
                    <div>
                        <div className="border-t-2 border-black pt-2 mt-16">
                            <p className="font-bold">Assinatura da Oficina</p>
                            <p className="text-xs text-gray-500 mt-1">Responsável Técnico</p>
                        </div>
                    </div>
                    <div>
                        <div className="border-t-2 border-black pt-2 mt-16">
                            <p className="font-bold">Aceite do Cliente</p>
                            <p className="text-xs text-gray-500 mt-1">CPF: {os.customer.document || "_________________"}</p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center text-xs text-gray-400 mt-12 print:hidden border-t pt-4">
                    <p>Pressione <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded">Ctrl+P</kbd> para imprimir se a janela não abrir automaticamente.</p>
                </div>
            </div>
        </>
    );
}
