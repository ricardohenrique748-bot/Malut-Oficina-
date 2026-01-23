"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Clock, Save, Plus, AlertTriangle, FileText, CheckCircle, Trash2, Search, Printer, Loader2, Barcode } from "lucide-react";
import { format } from "date-fns";
import { emitBlingInvoiceByOS, generateBlingBoletoByOS } from "../../financial/actions";

// Types
interface WorkOrder {
    id: string;
    code: number;
    status: string;
    customer: { name: string; phone: string };
    vehicle: { plate: string; brand: string; model: string } | null;
    seller: { id: string; name: string } | null;
    sellerId: string | null;
    items: Item[];
    totalParts: string;
    totalLabor: string;
    totalValue: string;
    createdAt: string;
    notes: string;
    statusHistory: History[];
}

interface Item {
    id: string;
    type: 'PART' | 'SERVICE';
    name: string;
    quantity: string;
    unitPrice: string;
    total: string;
}

interface History {
    id: string;
    newStatus: string;
    createdAt: string;
    notes: string;
    changedBy: { name: string };
}

const STATUS_FLOW = [
    'ABERTA', 'DIAGNOSTICO', 'ORCAMENTO', 'AGUARDANDO_APROVACAO', 'APROVADA', 'EM_EXECUCAO', 'TESTE_QUALIDADE', 'ENTREGUE'
];

export default function WorkOrderDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [os, setOs] = useState<WorkOrder | null>(null);
    const [loading, setLoading] = useState(true);
    const [emittingId, setEmittingId] = useState<string | null>(null);
    const [emittingBoletoId, setEmittingBoletoId] = useState<string | null>(null);
    const [showFinalizeModal, setShowFinalizeModal] = useState(false);

    // Modal States
    const [showItemModal, setShowItemModal] = useState(false);
    const [itemType, setItemType] = useState<'PART' | 'SERVICE'>('SERVICE');

    // New Item Form
    const [newItem, setNewItem] = useState({ name: "", quantity: "1", unitPrice: "0" });
    const [catalogParts, setCatalogParts] = useState<any[]>([]);
    const [catalogServices, setCatalogServices] = useState<any[]>([]);
    const [staff, setStaff] = useState<any[]>([]);
    const [updatingSeller, setUpdatingSeller] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("CASH");

    const fetchOS = async () => {
        try {
            const res = await fetch(`/api/work-orders/${params.id}`);
            if (res.ok) {
                const data = await res.json();
                setOs(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchCatalog = async () => {
        fetch('/api/catalog/parts').then(r => r.json()).then(setCatalogParts);
        fetch('/api/catalog/services').then(r => r.json()).then(setCatalogServices);
        fetch('/api/staff').then(r => r.json()).then(data => setStaff(data.users || []));
    };

    useEffect(() => {
        fetchOS();
        fetchCatalog();
    }, []);

    const handleAddItem = async () => {
        if (!os) return;

        // Find catalog item ID if it exists
        let catalogItemList = itemType === 'PART' ? catalogParts : catalogServices;
        let selectedItem = catalogItemList.find(c => c.name === newItem.name);

        try {
            await fetch(`/api/work-orders/${os.id}/items`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: itemType,
                    ...newItem,
                    catalogItemId: selectedItem ? selectedItem.id : null
                })
            });
            setShowItemModal(false);
            setNewItem({ name: "", quantity: "1", unitPrice: "0" });
            fetchOS();
        } catch (e) {
            alert("Erro ao adicionar item");
        }
    };

    const handleDeleteItem = async (itemId: string) => {
        if (!os) return;
        if (!confirm("Deseja realmente remover este item?")) return;

        try {
            await fetch(`/api/work-orders/${os.id}/items/${itemId}`, {
                method: 'DELETE'
            });
            fetchOS();
        } catch (e) {
            alert("Erro ao remover item");
        }
    };

    const handleStatusChange = async (newStatus: string) => {
        if (!os) return;

        // Intercept DIAGNOSTICO to open separate page
        if (newStatus === 'DIAGNOSTICO') {
            router.push(`/dashboard/work-orders/${os.id}/diagnosis`);
            return;
        }

        if (newStatus === 'ENTREGUE') {
            setShowFinalizeModal(true);
            return;
        }

        if (!confirm(`Mudar status para ${newStatus}?`)) return;

        try {
            await fetch(`/api/work-orders/${os.id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    newStatus,
                    paymentMethod // Pass selected payment method
                })
            });
            fetchOS();
        } catch (e) {
            alert("Erro ao mudar status");
        }
    };

    const handleSellerChange = async (sellerId: string) => {
        if (!os) return;
        setUpdatingSeller(true);
        try {
            await fetch(`/api/work-orders/${os.id}/status`, { // Reusing same generic patch if possible, or new route
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sellerId: sellerId || null })
            });
            fetchOS();
        } catch (e) {
            alert("Erro ao atualizar vendedor");
        } finally {
            setUpdatingSeller(false);
        }
    };

    const handleFinalizeWithPayment = async () => {
        if (!os) return;
        try {
            const res = await fetch(`/api/work-orders/${os.id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    newStatus: 'ENTREGUE',
                    paymentMethod
                })
            });
            if (res.ok) {
                setShowFinalizeModal(false);
                fetchOS();
            } else {
                alert("Erro ao finalizar OS");
            }
        } catch (e) {
            alert("Erro ao finalizar OS");
        }
    };

    const handleEmitNote = async () => {
        if (!os) return;
        if (!confirm(`Deseja emitir Nota Fiscal no Bling para a OS #${os.code}?`)) return;

        setEmittingId(os.id);
        try {
            const result = await emitBlingInvoiceByOS(os.id);
            alert(result.message);
        } catch (error) {
            alert("Erro ao conectar com Bling. Verifique as configurações de integração.");
        } finally {
            setEmittingId(null);
        }
    };

    const handleEmitBoleto = async () => {
        if (!os) return;
        if (!confirm(`Deseja gerar Boleto no Bling para a OS #${os.code}?`)) return;

        setEmittingBoletoId(os.id);
        try {
            const result = await generateBlingBoletoByOS(os.id);
            alert(result.message);
        } catch (error) {
            alert("Erro ao conectar com Bling. Verifique as configurações de integração.");
        } finally {
            setEmittingBoletoId(null);
        }
    };

    if (loading) return <div>Carregando...</div>;
    if (!os) return <div>OS não encontrada</div>;

    return (
        <div className="space-y-6 max-w-6xl mx-auto pb-20">
            {/* Header / Navigation */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 dark:border-gray-800 pb-6">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/work-orders" className="p-2 hover:bg-gray-50 rounded-full dark:hover:bg-gray-900 transition-colors">
                        <ArrowLeft className="h-5 w-5 text-gray-400" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-light tracking-tighter text-gray-900 dark:text-white">
                                OS <span className="font-medium">#{os.code}</span>
                            </h1>
                            <span className="text-[10px] px-2 py-0.5 border border-indigo-100 bg-indigo-50/30 text-indigo-600 rounded uppercase font-bold tracking-widest">
                                {os.status}
                            </span>
                        </div>
                        <p className="text-slate-500 dark:text-gray-400 text-xs mt-1 font-medium italic">Abertura: {format(new Date(os.createdAt), "dd/MM/yyyy HH:mm")}</p>
                    </div>
                </div>



                {/* Actions / Desktop Menu */}
                <div className="flex items-center gap-2">
                    {/* NF-e & Boleto Buttons */}
                    {(os.status === 'ENTREGUE' || os.status === 'FINALIZADA') && (
                        <div className="flex gap-2">
                            <button
                                onClick={handleEmitNote}
                                disabled={emittingId === os.id}
                                className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-2 rounded text-xs font-bold uppercase tracking-widest hover:bg-amber-100 flex items-center gap-2 transition-all shadow-sm disabled:opacity-50"
                            >
                                {emittingId === os.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                                Emitir NF-e
                            </button>
                            <button
                                onClick={handleEmitBoleto}
                                disabled={emittingBoletoId === os.id}
                                className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-2 rounded text-xs font-bold uppercase tracking-widest hover:bg-blue-100 flex items-center gap-2 transition-all shadow-sm disabled:opacity-50"
                            >
                                {emittingBoletoId === os.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Barcode className="h-4 w-4" />}
                                Gerar Boleto
                            </button>
                        </div>
                    )}

                    <button
                        onClick={async () => {
                            if (confirm("EXCLUIR esta Ordem de Serviço permanentemente?")) {
                                await fetch(`/api/work-orders/${os.id}`, { method: 'DELETE' });
                                router.push('/dashboard/work-orders');
                            }
                        }}
                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded dark:hover:bg-red-950/20 transition-all"
                        title="Excluir OS"
                    >
                        <Trash2 className="h-5 w-5" />
                    </button>

                    {/* Quick Actions (Next Status) */}
                    <div className="flex gap-2">
                        <Link
                            href={`/dashboard/work-orders/${os.id}/print`}
                            target="_blank"
                            className="bg-white border border-gray-100 text-gray-600 px-4 py-2 rounded text-xs font-bold uppercase tracking-widest hover:bg-gray-50 flex items-center gap-2 dark:bg-gray-950 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-gray-900 transition-all shadow-sm"
                        >
                            <Printer className="h-4 w-4" />
                            Imprimir
                        </Link>



                        {/* Simple logic to suggest next status */}
                        {/* This could be smarter based on role */}
                        {STATUS_FLOW.indexOf(os.status) < STATUS_FLOW.length - 1 && (
                            <button
                                onClick={() => handleStatusChange(STATUS_FLOW[STATUS_FLOW.indexOf(os.status) + 1])}
                                className="bg-indigo-600 text-white px-4 py-2 rounded text-xs font-bold uppercase tracking-widest hover:bg-indigo-700 flex items-center gap-2 transition-all shadow-sm"
                            >
                                <CheckCircle className="h-4 w-4" />
                                Avançar
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column: Info & History */}
                <div className="space-y-6">
                    {/* Customer & Vehicle */}
                    <div className="bg-white dark:bg-gray-950 rounded-xl border border-gray-100 dark:border-gray-900 p-6 shadow-sm">
                        <h3 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 mb-4 uppercase tracking-widest">Informações Gerais</h3>
                        <div className="space-y-6">
                            <div>
                                <Link href="#" className="font-bold text-slate-900 dark:text-white hover:text-indigo-600 text-xl tracking-tighter decoration-indigo-200 underline-offset-4 decoration-1 hover:underline">{os.customer.name}</Link>
                                <div className="text-xs text-slate-500 dark:text-gray-400 mt-1 font-mono tracking-tighter">{os.customer.phone}</div>
                            </div>
                            <div className="pt-4 border-t border-gray-50 dark:border-gray-900">
                                <div className="text-[10px] text-slate-500 dark:text-gray-400 font-bold uppercase mb-2">Vendedor</div>
                                <select
                                    disabled={updatingSeller}
                                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-lg text-sm font-bold text-gray-700 dark:text-gray-300 p-2 focus:ring-1 focus:ring-indigo-500 transition-all"
                                    value={os.sellerId || ""}
                                    onChange={(e) => handleSellerChange(e.target.value)}
                                >
                                    <option value="">Nenhum</option>
                                    {staff.filter((u: any) => ['ADMIN', 'VENDEDOR', 'RECEPCAO', 'GERENTE'].includes(u.role?.name)).map((u: any) => (
                                        <option key={u.id} value={u.id}>{u.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="bg-white dark:bg-gray-950 rounded-xl border border-gray-100 dark:border-gray-900 p-6 shadow-sm">
                        <h3 className="text-[10px] font-black text-slate-400 dark:text-gray-500 mb-3 uppercase tracking-widest">Observações Operacionais</h3>
                        <p className="text-slate-800 dark:text-gray-300 text-sm font-medium italic whitespace-pre-wrap leading-relaxed">{os.notes || "Nenhuma observação registrada."}</p>
                    </div>

                    {/* History Timeline */}
                    <div className="bg-white dark:bg-gray-950 rounded-xl border border-gray-100 dark:border-gray-900 p-6 shadow-sm">
                        <h3 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 mb-6 uppercase tracking-widest">Linha do Tempo</h3>
                        <div className="space-y-6 relative border-l border-gray-100 dark:border-gray-900 ml-2">
                            {os.statusHistory.map((h) => (
                                <div key={h.id} className="ml-4 relative">
                                    <div className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-slate-200 dark:bg-gray-800 border-2 border-white dark:border-gray-950 group-hover:bg-indigo-500 transition-colors"></div>
                                    <div className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tighter">{h.newStatus}</div>
                                    <div className="text-[10px] text-slate-500 dark:text-gray-400 font-bold">{format(new Date(h.createdAt), "dd/MM HH:mm")} • <span className="text-slate-400 dark:text-gray-500 italic font-medium">{h.changedBy?.name}</span></div>
                                    {h.notes && <div className="text-[10px] text-slate-600 dark:text-gray-500 mt-1 bg-slate-50 dark:bg-gray-900/50 p-2 rounded italic border border-slate-100 dark:border-gray-800 font-medium">{h.notes}</div>}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Items & Totals */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Show items only after ABERTA status */}
                    {os.status !== 'ABERTA' && (
                        <div className="bg-white dark:bg-gray-950 rounded-xl border border-gray-100 dark:border-gray-900 shadow-sm overflow-hidden">
                            <div className="px-6 py-5 border-b border-gray-50 dark:border-gray-900 flex justify-between items-center">
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white tracking-tight">Itens de Orçamento</h3>
                                <button
                                    onClick={() => setShowItemModal(true)}
                                    className="text-[10px] border border-indigo-100 text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-50 dark:border-indigo-900/50 dark:text-indigo-400 dark:hover:bg-indigo-950 font-bold uppercase tracking-widest transition-all"
                                >
                                    <Plus className="h-4 w-4 inline mr-1" /> ADICIONAR
                                </button>
                            </div>

                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 dark:bg-gray-900/50 text-slate-500 dark:text-gray-500 uppercase text-[10px] font-black tracking-widest border-b border-slate-100 dark:border-gray-900">
                                    <tr>
                                        <th className="px-6 py-4">Categoria</th>
                                        <th className="px-6 py-4">Descrição Detalhada</th>
                                        <th className="px-6 py-4 text-right">Qtd</th>
                                        {!['ABERTA', 'DIAGNOSTICO'].includes(os.status) && (
                                            <>
                                                <th className="px-6 py-4 text-right">Valor Unit.</th>
                                                <th className="px-6 py-4 text-right">Subtotal</th>
                                            </>
                                        )}
                                        <th className="px-6 py-4 text-center">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-gray-900 text-slate-700 dark:text-gray-400">
                                    {os.items.length === 0 ? (
                                        <tr><td colSpan={6} className="text-center py-12 text-gray-400 italic text-xs">Nenhum item listado até o momento.</td></tr>
                                    ) : (
                                        os.items.map((item) => (
                                            <tr key={item.id} className="hover:bg-gray-50/30 dark:hover:bg-gray-900/20 transition-colors">
                                                <td className="px-6 py-4">
                                                    <span className={`text-[10px] uppercase px-2 py-1 rounded-lg font-bold tracking-tighter ${item.type === 'SERVICE'
                                                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                                                        : 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400'
                                                        }`}>
                                                        {item.type === 'SERVICE' ? 'Mão de Obra' : 'Produto'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 font-medium text-gray-800 dark:text-gray-200">{item.name}</td>
                                                <td className="px-6 py-4 text-right font-mono text-xs">{Number(item.quantity)}</td>
                                                {!['ABERTA', 'DIAGNOSTICO'].includes(os.status) && (
                                                    <>
                                                        <td className="px-6 py-4 text-right font-mono text-xs italic text-gray-400">R$ {Number(item.unitPrice).toFixed(2)}</td>
                                                        <td className="px-6 py-4 text-right font-medium text-gray-900 dark:text-white">R$ {Number(item.total).toFixed(2)}</td>
                                                    </>
                                                )}
                                                <td className="px-6 py-4 text-center">
                                                    <button
                                                        onClick={() => handleDeleteItem(item.id)}
                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-all"
                                                        title="Remover item"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Info card for ABERTA status */}
                    {os.status === 'ABERTA' && (
                        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20 rounded-3xl border-2 border-indigo-100 dark:border-indigo-900/30 p-8 text-center">
                            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-indigo-200 dark:shadow-none">
                                <CheckCircle className="h-8 w-8 text-white" />
                            </div>
                            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">Ordem de Serviço Aberta</h3>
                            <p className="text-gray-600 dark:text-gray-400 font-medium mb-6 max-w-md mx-auto">
                                Esta OS foi criada com sucesso. Avance para <strong>DIAGNÓSTICO</strong> ou <strong>ORÇAMENTO</strong> para começar a adicionar itens e serviços.
                            </p>
                            <button
                                onClick={() => handleStatusChange('DIAGNOSTICO')}
                                className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 dark:shadow-none transition-all flex items-center justify-center gap-2 mx-auto active:scale-95"
                            >
                                <ArrowRight className="h-4 w-4" />
                                Iniciar Diagnóstico
                            </button>
                        </div>
                    )}

                    {/* Totals Box - Only show if NOT Aberta/Diagnostico */}
                    {!['ABERTA', 'DIAGNOSTICO'].includes(os.status) && (
                        <div className="bg-white dark:bg-gray-950 rounded-xl border border-gray-100 dark:border-gray-900 p-8 flex flex-col items-end shadow-sm">
                            <div className="w-full max-w-xs space-y-3">
                                <div className="flex justify-between text-xs font-black text-slate-500 dark:text-gray-500 uppercase tracking-widest border-b border-slate-50 dark:border-gray-900 pb-2">
                                    <span>Produtos</span>
                                    <span className="font-mono italic text-slate-900 dark:text-gray-200 font-bold">R$ {Number(os.totalParts).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-xs font-black text-slate-500 dark:text-gray-500 uppercase tracking-widest border-b border-slate-50 dark:border-gray-900 pb-2">
                                    <span>Serviços</span>
                                    <span className="font-mono italic text-slate-900 dark:text-gray-200 font-bold">R$ {Number(os.totalLabor).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-2xl font-light text-slate-950 dark:text-white pt-4 tracking-tighter">
                                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] self-center mr-4">Total Geral</span>
                                    <span>R$ <span className="font-black">{Number(os.totalValue).toFixed(2)}</span></span>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* Add Item Modal (Simple Inline Implementation) */}
            {showItemModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6">
                        <h3 className="text-lg font-bold mb-4">Adicionar Item</h3>

                        <div className="flex gap-4 mb-4">
                            <button
                                onClick={() => setItemType('SERVICE')}
                                className={`flex-1 py-2 rounded text-sm font-bold border ${itemType === 'SERVICE' ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-500'}`}
                            >
                                Serviço
                            </button>
                            <button
                                onClick={() => setItemType('PART')}
                                className={`flex-1 py-2 rounded text-sm font-bold border ${itemType === 'PART' ? 'bg-orange-600 text-white border-orange-600' : 'border-gray-200 text-gray-500'}`}
                            >
                                Peça
                            </button>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="text-xs font-bold uppercase text-gray-500">Descrição/Nome</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                    <input
                                        list="catalog"
                                        className="w-full border rounded p-2 pl-9"
                                        placeholder={itemType === 'PART' ? "Buscar peça por nome ou código..." : "Buscar serviço..."}
                                        value={newItem.name}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            const catalog = itemType === 'PART' ? catalogParts : catalogServices;
                                            const match = catalog.find(c => c.name === val || (c.sku && `${c.sku} - ${c.name}` === val));

                                            if (match) {
                                                setNewItem({
                                                    ...newItem,
                                                    name: match.name,
                                                    unitPrice: match.price || match.sellPrice || 0
                                                });
                                            } else {
                                                setNewItem({ ...newItem, name: val });
                                            }
                                        }}
                                        autoFocus
                                    />
                                </div>
                                <datalist id="catalog">
                                    {(itemType === 'PART' ? catalogParts : catalogServices).map((c: any) => (
                                        <option key={c.id} value={c.name}>
                                            {itemType === 'PART'
                                                ? `${c.sku ? `[${c.sku}] ` : ''}R$ ${c.price} | Est: ${c.stockQuantity}`
                                                : `R$ ${c.price}`}
                                        </option>
                                    ))}
                                </datalist>
                            </div>
                            <div className="flex gap-3">
                                <div className="flex-1">
                                    <label className="text-xs font-bold uppercase text-gray-500">Qtd</label>
                                    <input
                                        type="number"
                                        className="w-full border rounded p-2"
                                        value={newItem.quantity}
                                        onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="text-xs font-bold uppercase text-gray-500">Preço Unit.</label>
                                    <input
                                        type="number"
                                        className="w-full border rounded p-2"
                                        value={newItem.unitPrice}
                                        onChange={(e) => setNewItem({ ...newItem, unitPrice: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowItemModal(false)}
                                className="flex-1 py-2 border rounded text-gray-600 hover:bg-gray-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleAddItem}
                                className="flex-1 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-bold"
                            >
                                Salvar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showFinalizeModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl border border-gray-100 dark:border-gray-700">
                        <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center mb-6">
                            <Clock className="h-8 w-8 text-indigo-600" />
                        </div>
                        <h2 className="text-2xl font-black mb-2 dark:text-white">Finalizar OS</h2>
                        <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">Escolha a forma de pagamento para concluir a entrega da OS #{os.code}.</p>

                        <div className="grid grid-cols-2 gap-3 mb-8">
                            {[
                                { id: 'CASH', label: 'Dinheiro' },
                                { id: 'PIX', label: 'PIX' },
                                { id: 'CREDIT_CARD', label: 'Cartão' },
                                { id: 'BOLETO', label: 'Boleto' }
                            ].map((m) => (
                                <button
                                    key={m.id}
                                    onClick={() => setPaymentMethod(m.id)}
                                    className={`px-4 py-4 rounded-xl text-xs font-black uppercase border transition-all ${paymentMethod === m.id
                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200 dark:shadow-none'
                                        : 'bg-gray-50 dark:bg-gray-900 text-gray-400 border-transparent hover:bg-gray-100 dark:hover:bg-gray-800'
                                        }`}
                                >
                                    {m.label}
                                </button>
                            ))}
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowFinalizeModal(false)}
                                className="flex-1 py-4 font-black uppercase text-xs text-gray-400 hover:text-gray-600 transition"
                            >
                                Voltar
                            </button>
                            <button
                                onClick={handleFinalizeWithPayment}
                                className="flex-1 py-4 bg-indigo-600 text-white font-black uppercase text-xs rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none transition transform active:scale-95"
                            >
                                Confirmar Entrega
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
