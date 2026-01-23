"use client";

import { Package, Plus, Search, AlertCircle, History, X, RefreshCw, CheckCircle, TrendingUp, BarChart3, ArrowUpRight } from "lucide-react";
import { format } from "date-fns";
import { syncItemsWithBling, getBlingSyncInfo, syncBlingPage } from "./actions";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

interface Part {
    id: string;
    name: string;
    sku: string | null;
    price: number;
    stockQuantity: number;
    minStock: number;
}

interface Movement {
    id: string;
    type: 'IN' | 'OUT';
    quantity: number;
    referenceId: string | null;
    referenceLabel?: string | null;
    createdAt: string;
}

export default function InventoryPage() {
    const [parts, setParts] = useState<Part[]>([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [syncProgress, setSyncProgress] = useState(0);
    const [syncStatus, setSyncStatus] = useState("");
    const [showForm, setShowForm] = useState(false);

    // Movement History State
    const [selectedPart, setSelectedPart] = useState<Part | null>(null);
    const [movements, setMovements] = useState<Movement[]>([]);
    const [loadingMoves, setLoadingMoves] = useState(false);

    // New Part Form
    const [newPart, setNewPart] = useState({
        name: "", sku: "", price: "", costPrice: "", stockQuantity: "", minStock: ""
    });

    // Search & Filter State
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'AVAILABLE' | 'OUT' | 'LOW'>('ALL');
    const [viewMode, setViewMode] = useState<'LIST' | 'TURNOVER'>('LIST');

    // Turnover Data
    const [turnoverData, setTurnoverData] = useState<any[]>([]);
    const [loadingTurnover, setLoadingTurnover] = useState(false);

    const fetchParts = async () => {
        try {
            const res = await fetch("/api/catalog/parts");
            const data = await res.json();
            setParts(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMovements = async (part: Part) => {
        setSelectedPart(part);
        setLoadingMoves(true);
        try {
            const res = await fetch(`/api/catalog/parts/${part.id}/movements`);
            const data = await res.json();
            setMovements(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingMoves(false);
        }
    };

    const fetchTurnover = async () => {
        setLoadingTurnover(true);
        try {
            const res = await fetch("/api/catalog/inventory/turnover");
            const data = await res.json();
            setTurnoverData(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingTurnover(false);
        }
    };

    const availableCount = parts.filter(p => Number(p.stockQuantity) > 0).length;
    const outCount = parts.filter(p => Number(p.stockQuantity) <= 0).length;
    const lowCount = parts.filter(p => Number(p.stockQuantity) <= Number(p.minStock) && Number(p.stockQuantity) > 0).length;

    const filteredParts = parts.filter(part => {
        const matchesSearch = part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (part.sku && part.sku.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesStatus =
            statusFilter === 'ALL' ? true :
                statusFilter === 'AVAILABLE' ? Number(part.stockQuantity) > 0 :
                    statusFilter === 'OUT' ? Number(part.stockQuantity) <= 0 :
                        Number(part.stockQuantity) <= Number(part.minStock);

        return matchesSearch && matchesStatus;
    });

    useEffect(() => {
        fetchParts();
    }, []);

    useEffect(() => {
        if (viewMode === 'TURNOVER') {
            fetchTurnover();
        }
    }, [viewMode]);

    const handleCreatePart = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/catalog/parts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newPart)
            });

            if (res.ok) {
                setShowForm(false);
                setNewPart({ name: "", sku: "", price: "", costPrice: "", stockQuantity: "", minStock: "" });
                fetchParts();
            } else {
                alert("Erro ao cadastrar peça");
            }
        } catch (error) {
            alert("Erro ao cadastrar peça");
        }
    };

    const handleSyncBling = async () => {
        if (!confirm("Deseja sincronizar o estoque com o Bling agora?")) return;

        setSyncing(true);
        setSyncProgress(0);
        setSyncStatus("Iniciando...");

        try {
            // 1. Get initial info
            const info: any = await getBlingSyncInfo();
            if (!info.success) {
                alert(info.message);
                return;
            }

            let currentPage = 1;
            let totalProcessed = 0;
            let totalCreated = 0;
            let totalUpdated = 0;
            let hasMore = true;

            // We'll sync up to 50 pages (5000 items) as a safety limit
            while (hasMore && currentPage <= 50) {
                setSyncStatus(`Sincronizando página ${currentPage}...`);
                const result: any = await syncBlingPage(currentPage);

                if (!result.success) {
                    alert(`Erro na página ${currentPage}: ${result.message}`);
                    break;
                }

                totalProcessed += result.processed;
                totalCreated += result.createdCount;
                totalUpdated += result.updatedCount;
                hasMore = result.hasMore;

                // Update progress based on total pages
                const progress = Math.min(Math.round((currentPage / (info.totalPages || 1)) * 100), 99);
                setSyncProgress(progress);

                if (hasMore) currentPage++;
            }

            setSyncProgress(100);
            setSyncStatus("Finalizado!");
            alert(`Sincronização concluída!\n${totalCreated} criados, ${totalUpdated} atualizados.\nTotal: ${totalProcessed} itens.`);
            fetchParts();
        } catch (error) {
            console.error(error);
            alert("Erro ao sincronizar com Bling");
        } finally {
            setTimeout(() => {
                setSyncing(false);
                setSyncProgress(0);
                setSyncStatus("");
            }, 2000);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
                        <Package className="h-8 w-8 text-indigo-600" />
                        Estoque de Peças
                    </h1>
                    <p className="text-gray-500">Gerencie o inventário de peças e produtos.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <div className="bg-gray-100 dark:bg-gray-900 p-1 rounded-lg border dark:border-gray-700 flex mr-2">
                        <button
                            onClick={() => setViewMode('LIST')}
                            className={cn(
                                "px-3 py-1.5 text-xs font-bold rounded-md flex items-center gap-2 transition-all",
                                viewMode === 'LIST' ? "bg-white dark:bg-gray-800 text-indigo-600 shadow-sm" : "text-gray-500"
                            )}
                        >
                            <Package size={14} /> Inventário
                        </button>
                        <button
                            onClick={() => setViewMode('TURNOVER')}
                            className={cn(
                                "px-3 py-1.5 text-xs font-bold rounded-md flex items-center gap-2 transition-all",
                                viewMode === 'TURNOVER' ? "bg-white dark:bg-gray-800 text-indigo-600 shadow-sm" : "text-gray-500"
                            )}
                        >
                            <BarChart3 size={14} /> Giro
                        </button>
                    </div>
                    <button
                        onClick={handleSyncBling}
                        disabled={syncing}
                        className="relative flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded shadow-sm hover:bg-gray-50 transition disabled:opacity-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700 min-w-[160px] overflow-hidden"
                    >
                        {syncing && (
                            <div
                                className="absolute bottom-0 left-0 h-1 bg-indigo-500 transition-all duration-300"
                                style={{ width: `${syncProgress}%` }}
                            />
                        )}
                        <RefreshCw className={cn("h-4 w-4", syncing && "animate-spin")} />
                        <div className="flex flex-col items-start leading-tight">
                            <span className="text-sm">
                                {syncing ? (syncProgress > 0 ? `Sincronizando ${syncProgress}%` : "Sincronizando...") : "Sincronizar Bling"}
                            </span>
                            {syncing && syncStatus && (
                                <span className="text-[10px] text-gray-400 font-medium">{syncStatus}</span>
                            )}
                        </div>
                    </button>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700 transition"
                    >
                        <Plus className="h-4 w-4" />
                        Adicionar Peça
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                            <Package className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-medium">Total de Itens</p>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{parts.length}</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <Package className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-medium">Disponíveis</p>
                            <h3 className="text-xl font-bold text-green-600">{availableCount}</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                            <AlertCircle className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-medium">Estoque Baixo</p>
                            <h3 className="text-xl font-bold text-orange-600">{lowCount}</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                            <X className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-medium">Zerados</p>
                            <h3 className="text-xl font-bold text-red-600">{outCount}</h3>
                        </div>
                    </div>
                </div>
            </div>

            {viewMode === 'LIST' && (
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    {/* Search Bar */}
                    <div className="relative flex-1 w-full">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Pesquisar..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full pl-9 pr-10 py-2 border border-gray-200 rounded-lg leading-5 bg-white shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm("")}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            >
                                <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                            </button>
                        )}
                    </div>

                    {/* Status Filters */}
                    <div className="flex p-1 bg-gray-100 dark:bg-gray-900 rounded-lg border dark:border-gray-700 shrink-0">
                        <button
                            onClick={() => setStatusFilter('ALL')}
                            className={cn(
                                "px-4 py-1.5 text-xs font-bold rounded-md transition-all",
                                statusFilter === 'ALL'
                                    ? "bg-white dark:bg-gray-800 text-indigo-600 shadow-sm"
                                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
                            )}
                        >
                            Tudo ({parts.length})
                        </button>
                        <button
                            onClick={() => setStatusFilter('AVAILABLE')}
                            className={cn(
                                "px-4 py-1.5 text-xs font-bold rounded-md transition-all",
                                statusFilter === 'AVAILABLE'
                                    ? "bg-white dark:bg-gray-800 text-green-600 shadow-sm"
                                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
                            )}
                        >
                            Disponíveis ({availableCount})
                        </button>
                        <button
                            onClick={() => setStatusFilter('LOW')}
                            className={cn(
                                "px-4 py-1.5 text-xs font-bold rounded-md transition-all",
                                statusFilter === 'LOW'
                                    ? "bg-white dark:bg-gray-800 text-orange-600 shadow-sm"
                                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
                            )}
                        >
                            Estoque Mínimo ({lowCount})
                        </button>
                        <button
                            onClick={() => setStatusFilter('OUT')}
                            className={cn(
                                "px-4 py-1.5 text-xs font-bold rounded-md transition-all",
                                statusFilter === 'OUT'
                                    ? "bg-white dark:bg-gray-800 text-red-600 shadow-sm"
                                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
                            )}
                        >
                            Zerados ({outCount})
                        </button>
                    </div>
                </div>
            )}

            {viewMode === 'TURNOVER' && (
                <div className="bg-indigo-50 dark:bg-indigo-900/10 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/40 rounded-lg">
                            <TrendingUp className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-indigo-900 dark:text-indigo-100 text-sm">Análise de Giro (30 dias)</h3>
                            <p className="text-xs text-indigo-600/70 dark:text-indigo-400/70">Produtos com maior frequência de saída e volume de uso.</p>
                        </div>
                    </div>
                    <div className="text-right hidden sm:block">
                        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Total Processado</p>
                        <p className="text-lg font-black text-indigo-600">{turnoverData.length} Itens</p>
                    </div>
                </div>
            )}

            {showForm && (
                <div className="bg-white p-6 rounded-lg border shadow-sm dark:bg-gray-800 dark:border-gray-700">
                    <h2 className="text-lg font-bold mb-4">Nova Peça</h2>
                    <form onSubmit={handleCreatePart} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-1">Nome da Peça *</label>
                            <input
                                required
                                value={newPart.name}
                                onChange={e => setNewPart({ ...newPart, name: e.target.value })}
                                className="w-full p-2 border rounded dark:bg-gray-900"
                                placeholder="Ex: Filtro de Óleo"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Código (SKU)</label>
                            <input
                                value={newPart.sku}
                                onChange={e => setNewPart({ ...newPart, sku: e.target.value })}
                                className="w-full p-2 border rounded dark:bg-gray-900"
                                placeholder="Ex: FIL-001"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Preço de Venda *</label>
                            <input
                                required
                                type="number"
                                step="0.01"
                                value={newPart.price}
                                onChange={e => setNewPart({ ...newPart, price: e.target.value })}
                                className="w-full p-2 border rounded dark:bg-gray-900"
                                placeholder="0.00"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Custo (Opcional)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={newPart.costPrice}
                                onChange={e => setNewPart({ ...newPart, costPrice: e.target.value })}
                                className="w-full p-2 border rounded dark:bg-gray-900"
                                placeholder="0.00"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Estoque Atual</label>
                            <input
                                type="number"
                                value={newPart.stockQuantity}
                                onChange={e => setNewPart({ ...newPart, stockQuantity: e.target.value })}
                                className="w-full p-2 border rounded dark:bg-gray-900"
                                placeholder="0"
                            />
                        </div>
                        <div className="md:col-span-3 flex justify-end gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                            >
                                Salvar Produto
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {viewMode === 'LIST' ? (
                <div className="bg-white rounded-md shadow border dark:bg-gray-800 dark:border-gray-700 overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-700 uppercase text-xs dark:bg-gray-700 dark:text-gray-300">
                            <tr>
                                <th className="px-6 py-3">Produto</th>
                                <th className="px-6 py-3">Código</th>
                                <th className="px-6 py-3">Estoque</th>
                                <th className="px-6 py-3 text-right">Preço</th>
                                <th className="px-6 py-3 text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {loading ? (
                                <tr><td colSpan={5} className="p-4 text-center">Carregando...</td></tr>
                            ) : filteredParts.length === 0 ? (
                                <tr><td colSpan={5} className="p-4 text-center text-gray-500">Nenhuma peça encontrada.</td></tr>
                            ) : (
                                filteredParts.map((part) => (
                                    <tr key={part.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                            {part.name}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {part.sku || "-"}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${Number(part.stockQuantity) <= Number(part.minStock)
                                                ? "bg-red-100 text-red-700"
                                                : "bg-green-100 text-green-700"
                                                }`}>
                                                {Number(part.stockQuantity)} un
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-medium">
                                            R$ {Number(part.price).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => fetchMovements(part)}
                                                className="p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 rounded-full transition"
                                                title="Ver Histórico"
                                            >
                                                <History className="h-5 w-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="bg-white rounded-md shadow border dark:bg-gray-800 dark:border-gray-700 overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-700 uppercase text-xs dark:bg-gray-700 dark:text-gray-300">
                            <tr>
                                <th className="px-6 py-3">Produto / Ranking</th>
                                <th className="px-6 py-3 text-center">Saídas (30d)</th>
                                <th className="px-6 py-3 text-center">Frequência</th>
                                <th className="px-6 py-3 text-right">Estoque Atual</th>
                                <th className="px-6 py-3 text-right">Receita Est.</th>
                                <th className="px-6 py-3 text-center">Status Giro</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {loadingTurnover ? (
                                <tr><td colSpan={6} className="p-8 text-center">Calculando métricas de giro...</td></tr>
                            ) : turnoverData.length === 0 ? (
                                <tr><td colSpan={6} className="p-8 text-center text-gray-500 italic">Nenhum movimento de saída registrado nos últimos 30 dias.</td></tr>
                            ) : (
                                turnoverData.map((item, index) => (
                                    <tr key={item.id} className="hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs font-black text-gray-300 w-4">#{index + 1}</span>
                                                <div>
                                                    <p className="font-bold text-gray-900 dark:text-white text-sm">{item.name}</p>
                                                    <p className="text-[10px] text-gray-400 font-mono">{item.sku || 'S/ SKU'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg font-black text-xs">
                                                {item.totalOut} un
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex flex-col items-center">
                                                <span className="font-bold text-sm">{item.frequency}x</span>
                                                <span className="text-[9px] uppercase text-gray-400 font-black">Utilizado</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={cn(
                                                "font-bold text-sm",
                                                item.currentStock <= 0 ? "text-red-500" : "text-gray-600 dark:text-gray-400"
                                            )}>
                                                {item.currentStock} un
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-black text-indigo-600 dark:text-indigo-400">
                                            R$ {item.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {item.totalOut >= 10 ? (
                                                <span className="inline-flex items-center gap-1.2 bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border border-blue-500/20">
                                                    <ArrowUpRight size={10} /> Alta Demanda
                                                </span>
                                            ) : (
                                                <span className="text-[9px] font-black uppercase text-gray-400 tracking-wider">Regular</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Movement History Modal */}
            {selectedPart && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl border dark:border-gray-700 overflow-hidden">
                        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                            <div>
                                <h3 className="font-bold text-lg">Histórico de Movimentação</h3>
                                <p className="text-sm text-gray-500">{selectedPart.name}</p>
                            </div>
                            <button
                                onClick={() => setSelectedPart(null)}
                                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-4 max-h-[60vh] overflow-y-auto">
                            {loadingMoves ? (
                                <div className="text-center py-8 text-gray-500">Carregando histórico...</div>
                            ) : movements.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">Nenhuma movimentação registrada.</div>
                            ) : (
                                <div className="space-y-3">
                                    {movements.map((mov) => (
                                        <div
                                            key={mov.id}
                                            className="flex items-center justify-between p-3 rounded-lg border dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/30"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-full ${mov.type === 'IN' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                    }`}>
                                                    {mov.type === 'IN' ? <Plus size={16} /> : <X size={16} />}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-sm">
                                                        {mov.type === 'IN' ? 'Entrada' : 'Saída'}
                                                    </div>
                                                    <div className="text-xs text-gray-400">
                                                        {format(new Date(mov.createdAt), "dd/MM/yyyy 'às' HH:mm")}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className={`font-bold ${mov.type === 'IN' ? 'text-green-600' : 'text-red-600'
                                                    }`}>
                                                    {mov.type === 'IN' ? '+' : '-'}{mov.quantity} un
                                                </div>
                                                <div className="text-[10px] text-gray-400 font-mono">
                                                    Ref: {mov.referenceLabel || "N/A"}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="p-4 border-t dark:border-gray-700 flex justify-end">
                            <button
                                onClick={() => setSelectedPart(null)}
                                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-medium"
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
