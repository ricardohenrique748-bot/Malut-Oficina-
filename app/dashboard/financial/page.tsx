"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowUpCircle, ArrowDownCircle, DollarSign, Plus, Edit, Trash2, FileText, Loader2, Search, X, Check } from "lucide-react";
import { format } from "date-fns";
import { emitBlingInvoice } from "./actions";

export default function FinancialPage() {
    const [data, setData] = useState<{ records: any[], balance: number }>({ records: [], balance: 0 });
    const [loading, setLoading] = useState(true);
    const [emittingId, setEmittingId] = useState<string | null>(null);
    const [showClosure, setShowClosure] = useState(false);
    const [closureInputs, setClosureInputs] = useState({ manual: "", observations: "" });
    const [activeTab, setActiveTab] = useState<'ALL' | 'PAYABLE' | 'RECEIVABLE'>('ALL');

    const [searchTerm, setSearchTerm] = useState("");

    const fetchFinancials = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/financial');
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

    const filteredRecords = data.records.filter(r => {
        const matchesSearch = r.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (r.workOrder && `os #${r.workOrder.code}`.toLowerCase().includes(searchTerm.toLowerCase()));

        if (activeTab === 'PAYABLE') return matchesSearch && r.type === 'EXPENSE' && r.status === 'PENDING';
        if (activeTab === 'RECEIVABLE') return matchesSearch && r.type === 'INCOME' && r.status === 'PENDING';
        return matchesSearch;
    });

    const incomeTotal = data.records.filter(r => r.type === 'INCOME').reduce((a: number, b: any) => a + Number(b.amount), 0);
    const expenseTotal = data.records.filter(r => r.type === 'EXPENSE').reduce((a: number, b: any) => a + Number(b.amount), 0);

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir este lançamento permanentemente?")) return;

        try {
            const res = await fetch(`/api/financial/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchFinancials();
            } else {
                alert("Erro ao excluir. Verifique suas permissões.");
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleEdit = async (record: any) => {
        const newDesc = prompt("Nova descrição:", record.description);
        if (newDesc === null) return;

        const newVal = prompt("Novo valor:", record.amount);
        if (newVal === null) return;

        try {
            const res = await fetch(`/api/financial/${record.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    description: newDesc,
                    amount: Number(newVal)
                })
            });
            if (res.ok) {
                fetchFinancials();
            } else {
                alert("Erro ao atualizar.");
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleMarkAsPaid = async (id: string) => {
        if (!confirm("Confirmar recebimento/pagamento deste lançamento?")) return;

        try {
            const res = await fetch(`/api/financial/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: 'PAID',
                    paidAt: new Date()
                })
            });
            if (res.ok) {
                fetchFinancials();
            } else {
                alert("Erro ao confirmar pagamento.");
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleEmitNote = async (record: any) => {
        if (!confirm(`Deseja emitir nota fiscal no Bling para o lançamento: "${record.description}"?`)) return;

        setEmittingId(record.id);
        try {
            const result = await emitBlingInvoice(record.id);
            alert(result.message);
        } catch (error) {
            alert("Erro ao conectar com Bling.");
        } finally {
            setEmittingId(null);
        }
    };

    useEffect(() => {
        fetchFinancials();
    }, []);

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-20 px-4 md:px-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-200 dark:shadow-none">
                        <DollarSign className="text-white h-7 w-7" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-gray-900 dark:text-white">Financeiro</h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base font-medium">Gestão de receitas e despesas</p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    <button
                        onClick={() => setShowClosure(true)}
                        className="flex-1 md:flex-none px-6 py-3 text-sm font-black bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-100 dark:shadow-none transition flex items-center justify-center gap-2"
                    >
                        Fechamento de Caixa
                    </button>
                    <Link
                        href="/dashboard/financial/new"
                        className="flex-1 md:flex-none px-8 py-3 text-sm font-black bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 dark:shadow-none transition flex items-center justify-center gap-2 active:scale-95"
                    >
                        <Plus className="h-5 w-5" />
                        Novo Lançamento
                    </Link>
                </div>
            </div>

            {/* Closure Modal */}
            {showClosure && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-lg w-full shadow-2xl">
                        <h2 className="text-2xl font-black mb-2">Fechamento de Caixa</h2>
                        <p className="text-gray-500 mb-6 text-sm">Confira os valores do sistema com o seu saldo físico.</p>

                        <div className="space-y-4">
                            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl">
                                <p className="text-xs font-black uppercase text-gray-400 mb-1">Total no Sistema (Hoje)</p>
                                <p className="text-2xl font-black text-indigo-600">R$ {incomeTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase text-gray-400 mb-1">Saldo Físico (Dinheiro/Pix/Cartão)</label>
                                <input
                                    type="number"
                                    className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl p-4 text-xl font-black focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="0.00"
                                    value={closureInputs.manual}
                                    onChange={(e) => setClosureInputs({ ...closureInputs, manual: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase text-gray-400 mb-1">Observações</label>
                                <textarea
                                    className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl p-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none h-24"
                                    placeholder="Houve alguma divergência?..."
                                    value={closureInputs.observations}
                                    onChange={(e) => setClosureInputs({ ...closureInputs, observations: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex gap-4 mt-8">
                            <button
                                onClick={() => setShowClosure(false)}
                                className="flex-1 py-4 font-black uppercase text-xs text-gray-400 hover:text-gray-600 transition"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={async () => {
                                    if (!closureInputs.manual) return alert("Informe o saldo físico.");
                                    const diff = Number(closureInputs.manual) - incomeTotal;
                                    if (Math.abs(diff) > 0 && !confirm(`Divergência de R$ ${diff.toFixed(2)}. Confirmar mesmo assim?`)) return;

                                    await fetch('/api/financial/closure', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                            systemTotal: incomeTotal,
                                            manualTotal: Number(closureInputs.manual),
                                            observations: closureInputs.observations
                                        })
                                    });
                                    alert("Caixa fechado com sucesso!");
                                    setShowClosure(false);
                                    setClosureInputs({ manual: "", observations: "" });
                                }}
                                className="flex-1 py-4 bg-indigo-600 text-white font-black uppercase text-xs rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 dark:shadow-none transition"
                            >
                                Confirmar Fechamento
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Balance Card */}
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-8 rounded-2xl shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                    <div className="relative">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                <DollarSign className="h-6 w-6 text-white" />
                            </div>
                            <p className="text-xs font-black text-white/80 uppercase tracking-widest">Saldo Atual</p>
                        </div>
                        <h3 className="text-4xl font-black text-white mt-2">
                            R$ {data.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </h3>
                    </div>
                </div>

                {/* Income Card */}
                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                            <ArrowUpCircle className="h-7 w-7 text-green-600 dark:text-green-400" />
                        </div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Receitas</p>
                    </div>
                    <h3 className="text-3xl font-black text-green-600 dark:text-green-400 mt-2">
                        R$ {incomeTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 font-medium">
                        {data.records.filter(r => r.type === 'INCOME').length} lançamentos
                    </p>
                </div>

                {/* Expense Card */}
                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
                            <ArrowDownCircle className="h-7 w-7 text-red-600 dark:text-red-400" />
                        </div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Despesas</p>
                    </div>
                    <h3 className="text-3xl font-black text-red-600 dark:text-red-400 mt-2">
                        R$ {expenseTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 font-medium">
                        {data.records.filter(r => r.type === 'EXPENSE').length} lançamentos
                    </p>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 bg-white dark:bg-gray-800 p-2 rounded-2xl border border-gray-100 dark:border-gray-700">
                {[
                    { id: 'ALL', label: 'Todos' },
                    { id: 'PAYABLE', label: 'Contas a Pagar' },
                    { id: 'RECEIVABLE', label: 'Contas a Receber' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-tight transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 dark:shadow-none' : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Search Bar */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="relative max-w-xl">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Pesquisar por descrição ou OS..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-12 pr-12 py-3.5 border-none rounded-xl bg-gray-50 dark:bg-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 dark:text-white font-medium shadow-inner transition-all"
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm("")}
                            className="absolute inset-y-0 right-0 pr-4 flex items-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded-r-xl transition-colors"
                        >
                            <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        </button>
                    )}
                </div>
                {searchTerm && (
                    <p className="mt-3 text-xs text-gray-500 dark:text-gray-400 font-medium">
                        {filteredRecords.length} resultado(s) encontrado(s)
                    </p>
                )}
            </div>

            {/* Transactions List */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-wider">Últimos Lançamentos</h3>
                </div>

                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {loading ? (
                        <div className="py-20 flex flex-col items-center justify-center">
                            <Loader2 className="h-10 w-10 text-indigo-500 animate-spin mb-4" />
                            <p className="text-gray-400 font-medium">Carregando...</p>
                        </div>
                    ) : filteredRecords.length === 0 ? (
                        <div className="py-20 flex flex-col items-center justify-center">
                            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                                <FileText className="h-10 w-10 text-gray-300" />
                            </div>
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Nenhum registro encontrado</p>
                        </div>
                    ) : (
                        filteredRecords.map((r) => (
                            <div key={r.id} className="px-8 py-6 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors group">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    {/* Left: Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${r.type === 'INCOME' ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                                                {r.type === 'INCOME' ? (
                                                    <ArrowUpCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                                                ) : (
                                                    <ArrowDownCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-base font-bold text-gray-900 dark:text-white truncate">{r.description}</h4>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-xs text-gray-400 font-medium">
                                                        {format(new Date(r.createdAt), "dd/MM/yy")}
                                                    </span>
                                                    {r.paymentMethod && (
                                                        <span className="text-[10px] px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-gray-500 font-bold uppercase">{r.paymentMethod}</span>
                                                    )}
                                                    {r.category && (
                                                        <span className="text-[10px] px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/20 rounded text-indigo-500 font-bold uppercase">{r.category}</span>
                                                    )}
                                                    {r.workOrder && (
                                                        <>
                                                            <span className="text-gray-300">•</span>
                                                            <span className="text-xs font-bold text-indigo-500">OS #{r.workOrder.code}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: Status, Value & Actions */}
                                    <div className="flex items-center gap-6">
                                        {/* Status Badge */}
                                        <span className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-tight ${r.status === 'PAID' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                                            {r.status === 'PAID' ? 'Pago' : 'Pendente'}
                                        </span>

                                        {/* Value */}
                                        <div className="text-right min-w-[120px]">
                                            <div className={`text-xl font-black ${r.type === 'INCOME' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                {r.type === 'EXPENSE' ? '- ' : '+ '}
                                                R$ {Number(r.amount).toFixed(2)}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2">
                                            {r.status === 'PENDING' && (
                                                <button
                                                    onClick={() => handleMarkAsPaid(r.id)}
                                                    className="w-9 h-9 flex items-center justify-center text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl transition-colors"
                                                    title="Marcar como Pago/Recebido"
                                                >
                                                    <Check size={18} />
                                                </button>
                                            )}
                                            {r.type === 'INCOME' && r.workOrderId && (
                                                <button
                                                    onClick={() => handleEmitNote(r)}
                                                    disabled={emittingId === r.id}
                                                    className="w-9 h-9 flex items-center justify-center text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-xl transition-colors disabled:opacity-50"
                                                    title="Emitir Nota Fiscal (Bling)"
                                                >
                                                    {emittingId === r.id ? <Loader2 size={18} className="animate-spin" /> : <FileText size={18} />}
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleEdit(r)}
                                                className="w-9 h-9 flex items-center justify-center text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-colors"
                                                title="Editar"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(r.id)}
                                                className="w-9 h-9 flex items-center justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                                                title="Excluir"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
