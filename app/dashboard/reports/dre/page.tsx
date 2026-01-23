"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { TrendingUp, TrendingDown, DollarSign, PieChart, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function DREReportPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchDRE = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/reports/dre');
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
        fetchDRE();
    }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-screen">
            <Loader2 className="h-10 w-10 text-indigo-500 animate-spin mb-4" />
            <p className="text-gray-400 font-medium">Gerando Relatório DRE...</p>
        </div>
    );

    if (!data) return <div>Erro ao carregar relatório.</div>;

    const isHealthy = data.profitMargin >= 15;

    return (
        <div className="space-y-8 max-w-5xl mx-auto pb-20 px-4 md:px-0">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/financial" className="p-2 hover:bg-gray-100 rounded-full dark:hover:bg-gray-800 transition-colors">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="text-3xl font-black tracking-tight">Relatório DRE</h1>
                    <p className="text-gray-500 text-sm">Demonstrativo de Resultados do Exercício (Mês Atual)</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Profit Margin Card */}
                <div className={`p-8 rounded-3xl shadow-xl transition-all ${isHealthy ? 'bg-gradient-to-br from-green-500 to-emerald-600' : 'bg-gradient-to-br from-amber-500 to-orange-600'} text-white relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 transform rotate-45"></div>
                    <div className="relative">
                        <div className="flex items-center gap-2 mb-4">
                            <PieChart className="h-6 w-6" />
                            <span className="text-xs font-black uppercase tracking-widest opacity-80">Margem Líquida</span>
                        </div>
                        <h2 className="text-6xl font-black mb-2">{data.profitMargin.toFixed(1)}%</h2>
                        <div className="flex items-center gap-2">
                            {isHealthy ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                            <p className="text-sm font-bold">
                                {isHealthy ? "Sua oficina está saudável!" : "Atenção: Margem abaixo de 15%."}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Net Profit Card */}
                <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-4">
                        <DollarSign className="h-6 w-6 text-indigo-500" />
                        <span className="text-xs font-black uppercase tracking-widest text-gray-400">Lucro Líquido</span>
                    </div>
                    <h2 className="text-5xl font-black text-gray-900 dark:text-white">R$ {data.netProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h2>
                    <p className="text-sm text-gray-500 mt-2">Resultado final após todos os custos e impostos.</p>
                </div>
            </div>

            {/* DRE Breakdown */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-50 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                    <h3 className="text-sm font-black uppercase tracking-widest text-gray-400">Estrutura de Resultados</h3>
                </div>
                <div className="divide-y divide-gray-50 dark:divide-gray-800">
                    <DRELine label="(+) Receita Bruta" value={data.grossRevenue} color="text-green-600" isMain />
                    <DRELine label="(-) CMV (Custo de Peças)" value={data.cmv} color="text-red-500" />
                    <DRELine label="(=) Lucro Bruto" value={data.grossProfit} isSubtotal />
                    <DRELine label="(-) Despesas Operacionais" value={data.operatingExpenses} color="text-red-500" />
                    <DRELine label="(-) Impostos (Simulados 5%)" value={data.taxes} color="text-red-500" />
                    <div className="bg-indigo-50/50 dark:bg-indigo-900/10 px-8 py-8 flex justify-between items-center">
                        <span className="text-lg font-black text-indigo-600 uppercase tracking-widest">(=) Lucro Líquido</span>
                        <span className="text-3xl font-black text-indigo-600">R$ {data.netProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                </div>
            </div>

            {/* AI Insights */}
            {!isHealthy && (
                <div className="bg-amber-50 dark:bg-amber-900/10 border-l-4 border-amber-500 p-6 rounded-2xl">
                    <h4 className="text-amber-800 dark:text-amber-400 font-black mb-2 flex items-center gap-2">
                        💡 Sugestões da Malut Inteligência
                    </h4>
                    <ul className="text-amber-700 dark:text-amber-500/80 text-sm space-y-2 list-disc ml-5 font-medium">
                        <li>Revise o custo médio de suas peças (CMV alto).</li>
                        <li>Analise se a sua tabela de mão de obra está atualizada com o mercado.</li>
                        <li>Verifique despesas operacionais (Aluguel, Luz) que podem ser otimizadas.</li>
                    </ul>
                </div>
            )}
        </div>
    );
}

function DRELine({ label, value, color = "text-gray-900 dark:text-white", isMain = false, isSubtotal = false }: any) {
    return (
        <div className={`px-8 py-5 flex justify-between items-center ${isSubtotal ? 'bg-gray-50 dark:bg-gray-800/30' : ''}`}>
            <span className={`text-sm tracking-tight ${isMain || isSubtotal ? 'font-black uppercase' : 'font-medium text-gray-500'}`}>{label}</span>
            <span className={`font-mono text-base ${color} ${isMain || isSubtotal ? 'font-black' : 'font-bold'}`}>
                R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
        </div>
    );
}
