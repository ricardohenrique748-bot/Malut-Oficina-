"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Trash2, Plus, User, FileText, Save, CheckCircle, Calculator, Percent, Clock, Minus } from "lucide-react";
import { useRouter } from "next/navigation";

interface Item {
    id: string;
    name: string;
    price: number;
    type: 'PART' | 'SERVICE';
    stock?: number;
    sku?: string;
}

interface CartItem extends Item {
    quantity: number;
    discountPercent: number;
}

interface Customer {
    id: string;
    name: string;
}

export default function ProposalPDVPage() {
    const router = useRouter();
    const today = new Date().toISOString().split('T')[0];

    // Header State
    const [date, setDate] = useState(today);
    const [introduction, setIntroduction] = useState("");
    const [careOf, setCareOf] = useState(""); // Aos cuidados de

    // Search State
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<Item[]>([]);

    // Cart/Items State
    const [cart, setCart] = useState<CartItem[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [customerSearch, setCustomerSearch] = useState("");
    const [customersList, setCustomersList] = useState<Customer[]>([]);

    // Other State
    const [notes, setNotes] = useState(""); // Other items/obs
    const [globalDiscountPercent, setGlobalDiscountPercent] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState("PIX"); // Default payment method
    const [loading, setLoading] = useState(false);

    // --- FETCHING ---

    const fetchCatalog = async (query = "") => {
        if (!query && query.length === 0) {
            setSearchResults([]);
            return;
        }
        try {
            const res = await fetch(`/api/catalog/parts?search=${query}`);
            if (res.ok) {
                const parts = await res.json();
                const mappedParts = parts.map((p: any) => ({
                    id: p.id,
                    name: p.name,
                    price: Number(p.price),
                    type: 'PART',
                    stock: Number(p.stockQuantity),
                    sku: p.sku
                }));
                setSearchResults(mappedParts);
            }
        } catch (error) { console.error(error); }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery.length > 2) fetchCatalog(searchQuery);
            else setSearchResults([]);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        if (customerSearch.length > 2) {
            fetch(`/api/customers?search=${customerSearch}`)
                .then(res => res.json())
                .then(data => setCustomersList(data));
        } else {
            setCustomersList([]);
        }
    }, [customerSearch]);

    // --- ACTIONS ---

    const addItem = (item: Item) => {
        setCart(prev => {
            const index = prev.findIndex(i => i.id === item.id);
            if (index >= 0) {
                return prev.map((i, idx) =>
                    idx === index ? { ...i, quantity: i.quantity + 1 } : i
                );
            }
            return [...prev, { ...item, quantity: 1, discountPercent: 0 }];
        });
        setSearchQuery("");
        setSearchResults([]);
    };

    const removeItem = (index: number) => {
        setCart(prev => prev.filter((_, i) => i !== index));
    };

    const updateItem = (index: number, field: keyof CartItem, value: any) => {
        setCart(prev => prev.map((item, i) => {
            if (i === index) return { ...item, [field]: value };
            return item;
        }));
    };

    // --- CALCULATIONS ---

    const calculateTotals = () => {
        let totalItems = 0;
        let totalItemDiscounts = 0;

        cart.forEach(item => {
            const gross = item.price * item.quantity;
            const discount = gross * (item.discountPercent / 100);
            totalItems += gross;
            totalItemDiscounts += discount;
        });

        // 1. Calculate Subtotal after Item Discounts
        const subtotalAfterItemDiscounts = totalItems - totalItemDiscounts;

        // 2. Apply Global Discount % on that subtotal
        const globalDiscountValue = subtotalAfterItemDiscounts * (globalDiscountPercent / 100);

        // 3. Total Discount = Item Discounts + Global Discount Value
        const totalDiscount = totalItemDiscounts + globalDiscountValue;

        const finalTotal = subtotalAfterItemDiscounts - globalDiscountValue;

        return { totalItems, totalDiscount, finalTotal };
    };

    const { totalItems, totalDiscount, finalTotal } = calculateTotals();

    // --- SUBMIT ---

    const handleSubmit = async (status: 'ORCAMENTO' | 'FINALIZADA') => {
        if (!selectedCustomer) return alert("Selecione um cliente.");
        if (cart.length === 0) return alert("Adicione itens à proposta.");

        setLoading(true);
        try {
            const res = await fetch("/api/pdv", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    customerId: selectedCustomer.id,
                    vehicleId: null,
                    items: cart,
                    discount: totalDiscount,
                    paymentMethod, // Included in payload
                    introduction,
                    notes: `${careOf ? `Aos cuidados de: ${careOf}` : ''}\n${notes}`,
                    status
                })
            });

            if (res.ok) {
                alert(status === 'ORCAMENTO' ? "Proposta salva!" : "Venda finalizada!");
                router.push('/dashboard/pdv/history');
            } else {
                alert("Erro ao salvar.");
            }
        } catch (e) {
            alert("Erro de conexão.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-20 px-4 md:px-6">
            {/* Header / Title */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-none">
                        <FileText className="text-white h-7 w-7" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-gray-900 dark:text-white">Proposta Comercial</h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base font-medium">Gestão de orçamentos e fechamento de vendas</p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    <Link
                        href="/dashboard/pdv/history"
                        className="flex-1 md:flex-none px-5 py-2.5 text-sm font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-xl hover:bg-indigo-100 transition flex items-center justify-center gap-2 active:scale-95"
                    >
                        <Clock className="h-4 w-4" />
                        Histórico
                    </Link>
                    <button
                        onClick={() => router.back()}
                        className="flex-1 md:flex-none px-5 py-2.5 text-sm font-bold border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition active:scale-95"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={() => handleSubmit('FINALIZADA')}
                        disabled={loading}
                        className="w-full md:w-auto px-8 py-2.5 text-sm font-black bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 shadow-lg shadow-indigo-100 dark:shadow-none transition flex items-center justify-center gap-2 active:scale-95"
                    >
                        {loading ? "..." : (
                            <>
                                <CheckCircle className="h-4 w-4" />
                                Finalizar Venda
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Form & Items */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Card: Dados Iniciais */}
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-2 mb-6 border-b border-gray-50 dark:border-gray-700 pb-4">
                            <User className="text-indigo-500 h-5 w-5" />
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-wider">Identificação do Cliente</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-2 relative">
                                <label className="block text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 mb-1.5 tracking-widest">Cliente Requerido</label>
                                {selectedCustomer ? (
                                    <div className="flex bg-indigo-50/50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-xl p-3 items-center justify-between group transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                                                {selectedCustomer.name.charAt(0)}
                                            </div>
                                            <span className="font-bold text-indigo-900 dark:text-indigo-100">{selectedCustomer.name}</span>
                                        </div>
                                        <button onClick={() => setSelectedCustomer(null)} className="text-red-500 hover:text-red-600 text-xs font-black uppercase tracking-tight px-3 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors">Trocar</button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="relative">
                                            <input
                                                className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl p-3.5 pl-11 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-inner"
                                                placeholder="Pesquise pelo nome do cliente..."
                                                value={customerSearch}
                                                onChange={e => setCustomerSearch(e.target.value)}
                                            />
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                                        </div>
                                        {customersList.length > 0 && (
                                            <div className="absolute z-50 w-full bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-2xl mt-2 max-h-56 overflow-y-auto rounded-2xl p-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                                {customersList.map(c => (
                                                    <button
                                                        key={c.id}
                                                        onClick={() => { setSelectedCustomer(c); setCustomerSearch(""); }}
                                                        className="w-full text-left p-3 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition-colors flex items-center gap-3"
                                                    >
                                                        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 flex items-center justify-center font-bold text-xs uppercase">
                                                            {c.name.charAt(0)}
                                                        </div>
                                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{c.name}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 mb-1.5 tracking-widest">Data do Orçamento</label>
                                <input
                                    type="date"
                                    value={date}
                                    onChange={e => setDate(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl p-3.5 text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none shadow-inner"
                                />
                            </div>
                        </div>

                        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 mb-1.5 tracking-widest">Aos cuidados de (Opcional)</label>
                                <input
                                    value={careOf}
                                    onChange={e => setCareOf(e.target.value)}
                                    placeholder="Nome do responsável no cliente"
                                    className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl p-3.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none shadow-inner"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 mb-1.5 tracking-widest">Introdução Curta</label>
                                <input
                                    value={introduction}
                                    onChange={e => setIntroduction(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl p-3.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none shadow-inner"
                                    placeholder="Ex: Segue proposta para serviços de motor"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Card: Itens da Proposta */}
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-8 border-b border-gray-50 dark:border-gray-700 pb-4">
                            <div className="flex items-center gap-2">
                                <Plus className="text-green-500 h-5 w-5" />
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-wider">Itens e Produtos</h2>
                            </div>
                            <span className="text-xs font-black uppercase tracking-tighter text-gray-400">{cart.length} itens no carrinho</span>
                        </div>

                        {/* Item Search Bar */}
                        <div className="relative mb-8 group">
                            <div className="relative overflow-hidden rounded-2xl shadow-lg shadow-indigo-500/5 ring-1 ring-gray-100 dark:ring-gray-700 group-focus-within:ring-2 group-focus-within:ring-indigo-500 transition-all duration-300">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2">
                                    <Search className="text-gray-400 h-6 w-6 group-focus-within:scale-110 group-focus-within:text-indigo-500 transition-all" />
                                </div>
                                <input
                                    className="bg-white dark:bg-gray-900 w-full py-5 pl-14 pr-8 outline-none text-base md:text-lg font-medium text-gray-900 dark:text-white placeholder-gray-400"
                                    placeholder="O que você deseja adicionar? Digite nome ou código..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                />
                            </div>

                            {searchResults.length > 0 && (
                                <div className="absolute z-40 w-full bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-2xl mt-4 max-h-[400px] overflow-y-auto rounded-2xl p-3 animate-in fade-in slide-in-from-top-4 duration-300">
                                    <div className="grid grid-cols-1 gap-1">
                                        {searchResults.map(item => (
                                            <button
                                                key={item.id}
                                                onClick={() => addItem(item)}
                                                className="w-full text-left p-4 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition-all flex justify-between items-center group/item hover:scale-[1.01]"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center font-bold text-gray-400 group-hover/item:bg-indigo-100 dark:group-hover/item:bg-indigo-800 group-hover/item:text-indigo-500 transition-colors">
                                                        {item.type === 'PART' ? <Calculator size={20} /> : <FileText size={20} />}
                                                    </div>
                                                    <div>
                                                        <span className="block text-gray-900 dark:text-white font-bold text-base leading-tight">
                                                            {item.name}
                                                        </span>
                                                        <span className="text-xs font-black uppercase tracking-widest text-gray-400 group-hover/item:text-indigo-400 transition-colors">
                                                            Cód: {item.sku || 'N/A'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">
                                                        R$ {item.price.toFixed(2)}
                                                    </span>
                                                    <span className={`text-[10px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-full ${item.stock && item.stock > 0 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                                                        {item.stock} unidades
                                                    </span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Items Table/List */}
                        <div className="space-y-4">
                            {cart.length === 0 ? (
                                <div className="py-20 flex flex-col items-center justify-center bg-gray-50/50 dark:bg-gray-900/30 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700 transition-all">
                                    <div className="w-20 h-20 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-sm mb-4">
                                        <Plus className="text-gray-300 h-10 w-10" />
                                    </div>
                                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Nenhum item adicionado à proposta</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {cart.map((item, idx) => {
                                        const total = (item.price * item.quantity) * (1 - item.discountPercent / 100);
                                        return (
                                            <div key={idx} className="group py-6 first:pt-0 last:pb-0 flex flex-col md:flex-row gap-6 items-start md:items-center animate-in fade-in slide-in-from-left-2 duration-300">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <span className="flex-none bg-gray-100 dark:bg-gray-700 text-gray-400 text-[10px] font-black w-6 h-6 rounded flex items-center justify-center">{idx + 1}</span>
                                                        <h4 className="text-lg font-black text-gray-900 dark:text-white truncate">{item.name}</h4>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">SKU: {item.sku || '-'}</span>
                                                        <span className="text-xs font-bold text-gray-500 dark:text-gray-400">R$ {item.price.toFixed(2)} / un</span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4 w-full md:w-auto">
                                                    <div className="flex-1 md:w-32">
                                                        <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Quantidade</label>
                                                        <div className="flex items-center bg-gray-50 dark:bg-gray-900 rounded-xl shadow-inner p-1">
                                                            <button
                                                                onClick={() => updateItem(idx, 'quantity', Math.max(1, item.quantity - 1))}
                                                                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
                                                            >
                                                                <Minus size={14} />
                                                            </button>
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                value={item.quantity}
                                                                onChange={e => updateItem(idx, 'quantity', Number(e.target.value))}
                                                                className="w-12 bg-transparent border-none text-center font-black text-gray-900 dark:text-white focus:ring-0 outline-none p-0"
                                                            />
                                                            <button
                                                                onClick={() => updateItem(idx, 'quantity', item.quantity + 1)}
                                                                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
                                                            >
                                                                <Plus size={14} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 md:w-24">
                                                        <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Desc %</label>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max="100"
                                                            value={item.discountPercent}
                                                            onChange={e => updateItem(idx, 'discountPercent', Number(e.target.value))}
                                                            className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl px-4 py-2 font-black text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none shadow-inner"
                                                        />
                                                    </div>
                                                    <div className="flex-none w-28 text-right pt-4 md:pt-0">
                                                        <label className="hidden md:block text-[10px] font-black uppercase text-gray-400 mb-1">Subtotal</label>
                                                        <div className="text-lg font-black text-gray-900 dark:text-white">R$ {total.toFixed(2)}</div>
                                                    </div>
                                                    <button
                                                        onClick={() => removeItem(idx)}
                                                        className="flex-none w-10 h-10 flex items-center justify-center text-red-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all shadow-sm md:mt-4"
                                                        title="Remover item"
                                                    >
                                                        <Trash2 size={20} />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Card: Observações */}
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-2 mb-6 border-b border-gray-50 dark:border-gray-700 pb-4">
                            <FileText className="text-amber-500 h-5 w-5" />
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-wider">Outras Observações</h2>
                        </div>
                        <textarea
                            rows={4}
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl p-4 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-inner"
                            placeholder="Detalhes adicionais, condições de pagamento, validade da proposta..."
                        />
                    </div>
                </div>

                {/* Right Column: Calculations & Finalize */}
                <div className="space-y-6">
                    {/* Card: Resumo e Totais */}
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 sticky top-6 ring-2 ring-indigo-500 ring-offset-4 ring-offset-gray-50 dark:ring-offset-black">
                        <div className="flex items-center gap-2 mb-8 border-b dark:border-gray-700 pb-4">
                            <Calculator className="text-indigo-600 h-5 w-5" />
                            <h2 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-wider">Resumo de Valores</h2>
                        </div>

                        <div className="space-y-6">
                            <div className="flex justify-between items-center text-gray-500 dark:text-gray-400">
                                <span className="text-xs font-bold uppercase tracking-widest">Subtotal Bruto</span>
                                <span className="font-bold">R$ {totalItems.toFixed(2)}</span>
                            </div>

                            <div className="space-y-2 border-b border-gray-100 dark:border-gray-700 pb-6">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold uppercase tracking-widest text-red-500">Desconto Extra (R$)</span>
                                    <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-xl border border-red-100 dark:border-red-800 transition-all">
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={globalDiscountPercent}
                                            onChange={e => setGlobalDiscountPercent(Number(e.target.value))}
                                            className="w-20 bg-transparent text-right font-black text-red-600 dark:text-red-400 outline-none"
                                        />
                                        <Percent size={14} className="text-red-400" />
                                    </div>
                                </div>
                                <div className="flex justify-between items-center text-red-400">
                                    <span className="text-[10px] font-black uppercase tracking-tighter">Total descontado</span>
                                    <span className="text-sm font-bold">- R$ {totalDiscount.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="pt-2">
                                <div className="flex flex-col text-right">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 mb-1">Valor Final da Proposta</span>
                                    <div className="text-4xl lg:text-5xl font-black text-indigo-600 dark:text-indigo-400 tracking-tighter">
                                        R$ {finalTotal.toFixed(2)}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Method Selector */}
                        <div className="mt-8 space-y-3 p-4 bg-gray-50/50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Forma de Pagamento</label>
                            <div className="grid grid-cols-2 gap-2">
                                {['PIX', 'CREDIT_CARD', 'BOLETO', 'CASH'].map((method) => (
                                    <button
                                        key={method}
                                        onClick={() => setPaymentMethod(method)}
                                        className={`px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all ${paymentMethod === method
                                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200 dark:shadow-none'
                                            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-indigo-300'
                                            }`}
                                    >
                                        {method === 'CREDIT_CARD' ? 'Crédito' : method === 'CASH' ? 'Dinheiro' : method}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mt-8 space-y-3">
                            <button
                                onClick={() => handleSubmit('ORCAMENTO')}
                                disabled={loading}
                                className="w-full py-4 bg-white dark:bg-gray-700 border-2 border-indigo-100 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm"
                            >
                                <Save size={16} />
                                Salvar como Orçamento
                            </button>
                            <button
                                onClick={() => handleSubmit('FINALIZADA')}
                                disabled={loading}
                                className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-[0.15em] text-sm hover:bg-indigo-700 transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-xl shadow-indigo-200 dark:shadow-none"
                            >
                                <CheckCircle size={20} />
                                Finalizar Venda
                            </button>
                        </div>

                        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                            <div className="flex items-start gap-3">
                                <div className="p-1 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg">
                                    <Save size={14} />
                                </div>
                                <p className="text-[10px] leading-relaxed text-gray-500 dark:text-gray-400 font-medium italic">
                                    Ao finalizar venda, as peças serão baixadas do estoque e a OS será enviada para o faturamento.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
