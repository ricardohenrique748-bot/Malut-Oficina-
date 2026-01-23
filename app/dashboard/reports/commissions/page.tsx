"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Users, TrendingUp, DollarSign, Loader2, ArrowLeft, Award } from "lucide-react";
import Link from "next/link";

export default function CommissionsReportPage() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchCommissions = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/reports/commissions');
            if (res.ok) {
                const json = await res.json();
                setData(json);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCommissions();
    }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-screen">
            <Loader2 className="h-10 w-10 text-indigo-500 animate-spin mb-4" />
            <p className="text-gray-400 font-medium">Calculando Produtividade e Comissões...</p>
        </div>
    );

    return (
        <div className="space-y-8 max-w-6xl mx-auto pb-20 px-4 md:px-0">
            <div className="flex items-center gap-4">
                <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-full dark:hover:bg-gray-800 transition-colors">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="text-3xl font-black tracking-tight">Produtividade & Comissões</h1>
                    <p className="text-gray-500 text-sm">Relatório baseado em serviços finalizados no mês atual.</p>
                </div>
            </div>

            {/* Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {data.map((worker) => (
                    <div key={worker.workerId} className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all group">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
                                <Award className="h-7 w-7 text-indigo-600 group-hover:text-white transition-colors" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-gray-900 dark:text-white leading-none mb-1">{worker.workerName}</h3>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] text-indigo-500 font-black uppercase tracking-widest bg-indigo-50 dark:bg-indigo-900/40 px-1.5 py-0.5 rounded">{worker.role}</span>
                                    <span className="text-gray-300">•</span>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{worker.ordersCount} OS</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-black uppercase text-gray-400 tracking-tighter">Total Produzido</span>
                                <span className="text-lg font-black text-gray-900 dark:text-white font-mono">R$ {worker.totalProduced.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            </div>

                            <div className="pt-4 border-t border-gray-50 dark:border-gray-700">
                                <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400">
                                    <span className="text-xs font-black uppercase tracking-widest">Comissão ({worker.commissionRate}%)</span>
                                    <span className="text-2xl font-black font-mono">R$ {worker.commission.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {data.length === 0 && (
                    <div className="col-span-full py-20 bg-gray-50 dark:bg-gray-900 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center">
                        <Users className="h-12 w-12 text-gray-300 mb-4" />
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Nenhum mecânico com produção este mês</p>
                    </div>
                )}
            </div>

            {/* Note about calculation */}
            <div className="bg-indigo-50/50 dark:bg-indigo-900/10 p-6 rounded-3xl border border-indigo-100 dark:border-indigo-900/30">
                <h4 className="text-[10px] font-black uppercase text-indigo-600 mb-2 tracking-widest">Regras de Cálculo</h4>
                <ul className="text-indigo-800 dark:text-indigo-400 text-xs font-medium space-y-2">
                    <li className="flex gap-2">
                        <div className="h-1.5 w-1.5 bg-indigo-400 rounded-full mt-1.5 shrink-0"></div>
                        <span><strong>Mecânicos:</strong> Comissão baseada na taxa individual sobre o valor total de <strong>Mão de Obra</strong>.</span>
                    </li>
                    <li className="flex gap-2">
                        <div className="h-1.5 w-1.5 bg-indigo-400 rounded-full mt-1.5 shrink-0"></div>
                        <span><strong>Vendedores / Outros:</strong> Comissão baseada na taxa individual sobre o <strong>Valor Total</strong> da Ordem de Serviço.</span>
                    </li>
                    <li className="flex gap-2 text-[10px] italic mt-2 opacity-70">
                        * Apenas Ordens de Serviço com status "FINALIZADA" ou "ENTREGUE" são consideradas.
                    </li>
                </ul>
            </div>
        </div>
    );
}
