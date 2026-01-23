"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Wrench, Calendar, User, Car, Search, X, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// Enum mapping for nice labels
const STATUS_LABELS: Record<string, string> = {
    'ABERTA': 'Abertura',
    'DIAGNOSTICO': 'Diagnóstico',
    'ORCAMENTO': 'Orçamento',
    'AGUARDANDO_APROVACAO': 'Aguardando Aprovação',
    'APROVADA': 'Aprovada',
    'EM_EXECUCAO': 'Em Execução',
    'TESTE_QUALIDADE': 'Em Teste',
    'FINALIZADA': 'Finalizada',
    'ENTREGUE': 'Entregue',
    'GARANTIA': 'Garantia'
};

const STATUS_COLORS: Record<string, string> = {
    'ABERTA': 'bg-gray-100 text-gray-800',
    'DIAGNOSTICO': 'bg-yellow-100 text-yellow-800',
    'ORCAMENTO': 'bg-blue-100 text-blue-800',
    'AGUARDANDO_APROVACAO': 'bg-orange-100 text-orange-800',
    'APROVADA': 'bg-green-100 text-green-800',
    'EM_EXECUCAO': 'bg-purple-100 text-purple-800',
    'TESTE_QUALIDADE': 'bg-indigo-100 text-indigo-800',
    'FINALIZADA': 'bg-green-200 text-green-900',
    'ENTREGUE': 'bg-gray-200 text-gray-800',
};

export default function WorkOrdersPage() {
    const [workOrders, setWorkOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [searchTerm, setSearchTerm] = useState("");

    const fetchOS = async () => {
        setLoading(true);
        try {
            const url = statusFilter === 'ALL'
                ? '/api/work-orders'
                : `/api/work-orders?status=${statusFilter}`;

            const res = await fetch(url);
            const data = await res.json();
            const onlyWorkOrders = data.filter((os: any) => os.vehicle !== null);
            setWorkOrders(onlyWorkOrders);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const filteredOS = workOrders.filter(os =>
        os.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (os.vehicle?.plate && os.vehicle.plate.toLowerCase().includes(searchTerm.toLowerCase())) ||
        `#${os.code}`.includes(searchTerm)
    );

    const openCount = workOrders.filter(os => os.status === 'ABERTA' || os.status === 'DIAGNOSTICO').length;
    const progressCount = workOrders.filter(os => os.status === 'EM_EXECUCAO' || os.status === 'APROVADA').length;
    const finishedCount = workOrders.filter(os => os.status === 'FINALIZADA' || os.status === 'ENTREGUE').length;

    useEffect(() => {
        fetchOS();
    }, [statusFilter]);

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-light tracking-tighter text-gray-900 dark:text-white">
                        Ordens de <span className="font-medium">Serviço</span>
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">Gestão de fluxo e monitoramento operacional.</p>
                </div>
                <Link
                    href="/dashboard/work-orders/new"
                    className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white shadow-sm hover:bg-indigo-700 transition-all"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Nova OS
                </Link>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-950 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-900">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                            <Clock className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Aguardando</p>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1">{openCount}</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-950 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-900">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                            <Wrench className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Em Execução</p>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1">{progressCount}</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-950 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-900">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                            <CheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Finalizadas</p>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1">{finishedCount}</h3>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 items-center">
                {/* Search Bar */}
                <div className="relative flex-1 w-full max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Pesquisar por cliente, placa ou OS..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-9 pr-10 py-2.5 border border-gray-100 dark:border-gray-900 bg-white dark:bg-gray-950 rounded-xl text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-gray-900 dark:text-white"
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm("")}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                            <X className="h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors" />
                        </button>
                    )}
                </div>

                {/* Filter Tabs */}
                <div className="flex overflow-x-auto gap-2 pb-1 no-scrollbar flex-1 justify-end">
                    <button
                        onClick={() => setStatusFilter("ALL")}
                        className={cn(
                            "px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-full transition-all border",
                            statusFilter === 'ALL' ? 'bg-gray-900 text-white border-gray-900 shadow-sm' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200 shadow-sm dark:bg-gray-950 dark:border-gray-900'
                        )}
                    >
                        Todas
                    </button>
                    {Object.entries(STATUS_LABELS).map(([key, label]) => (
                        <button
                            key={key}
                            onClick={() => setStatusFilter(key)}
                            className={cn(
                                "px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-full whitespace-nowrap transition-all border",
                                statusFilter === key ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200 shadow-sm dark:bg-gray-950 dark:border-gray-900'
                            )}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 gap-3">
                {loading ? (
                    <div className="text-center py-20 text-gray-400 text-sm animate-pulse tracking-widest font-bold uppercase">Sincronizando...</div>
                ) : filteredOS.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-gray-950 rounded-2xl border border-dashed border-gray-100 dark:border-gray-900 text-gray-400 text-xs font-medium italic">Nenhuma OS encontrada para este filtro.</div>
                ) : (
                    filteredOS.map((os) => (
                        <Link
                            key={os.id}
                            href={`/dashboard/work-orders/${os.id}`}
                            className="group block bg-white dark:bg-gray-950 rounded-2xl border border-gray-100 dark:border-gray-900 hover:border-indigo-100 dark:hover:border-indigo-900/50 transition-all p-6 relative shadow-sm"
                        >
                            <div className="absolute top-6 right-6">
                                <span className={`text-[10px] px-2 py-0.5 border rounded uppercase font-bold tracking-widest ${STATUS_COLORS[os.status] || 'bg-gray-50 border-gray-100 text-gray-400'}`}>
                                    {STATUS_LABELS[os.status] || os.status}
                                </span>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-8 items-center">
                                <div className="flex items-center gap-5">
                                    <div className="h-12 w-12 rounded-xl border border-gray-50 dark:border-gray-900 flex items-center justify-center bg-gray-50/30 dark:bg-gray-950 hidden sm:flex text-gray-300 group-hover:text-indigo-500 group-hover:border-indigo-50 transition-all">
                                        <Wrench className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tighter">
                                            OS <span>#{os.code}</span>
                                        </h3>
                                        <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-gray-400 mt-1 font-bold italic">
                                            <Calendar className="h-3 w-3" />
                                            {format(new Date(os.createdAt), "dd/MM/yyyy • HH:mm")}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 w-full sm:w-auto flex flex-col sm:flex-row gap-4 sm:gap-12">
                                    <div className="flex items-center gap-3">
                                        <div className="h-7 w-7 rounded-full border border-gray-50 dark:border-gray-900 flex items-center justify-center text-gray-300">
                                            <User className="h-3 w-3" />
                                        </div>
                                        <div>
                                            <div className="text-[10px] text-slate-500 dark:text-gray-500 font-black uppercase tracking-widest">Cliente</div>
                                            <div className="text-sm font-bold text-slate-900 dark:text-gray-200">{os.customer.name}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="h-7 w-7 rounded-full border border-gray-50 dark:border-gray-900 flex items-center justify-center text-gray-300">
                                            <Car className="h-3 w-3" />
                                        </div>
                                        <div>
                                            <div className="text-[10px] text-slate-500 dark:text-gray-500 font-black uppercase tracking-widest">Veículo</div>
                                            <div className="text-sm font-bold text-slate-900 dark:text-gray-200">
                                                {os.vehicle
                                                    ? `${os.vehicle.brand} ${os.vehicle.model}`
                                                    : "PDV / Venda Direta"}
                                            </div>
                                            {os.vehicle && <div className="text-[10px] font-mono font-bold text-slate-600 dark:text-gray-400 mt-0.5">{os.vehicle.plate}</div>}
                                        </div>
                                    </div>
                                </div>

                                <div className="text-right w-full sm:w-48 pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-50 dark:border-gray-900">
                                    <div className="text-[10px] text-slate-500 dark:text-gray-500 font-black uppercase tracking-widest mb-1">Total Geral</div>
                                    <div className="text-xl font-bold text-slate-950 dark:text-white tracking-tighter">
                                        <span className="text-xs font-black mr-1 text-slate-400 dark:text-gray-500 uppercase">R$</span>
                                        <span>{Number(os.totalValue).toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}
