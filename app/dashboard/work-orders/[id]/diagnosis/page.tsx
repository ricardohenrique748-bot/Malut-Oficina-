
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, FileText, ClipboardList, Plus, Trash2, ListChecks } from "lucide-react";

interface WorkOrder {
    id: string;
    code: number;
    customer: { name: string };
    vehicle: { brand: string; model: string; plate: string };
    notes: string | null;
}

export default function DiagnosisPage() {
    const params = useParams();
    const router = useRouter();
    const [os, setOs] = useState<WorkOrder | null>(null);
    const [report, setReport] = useState("");
    const [items, setItems] = useState<string[]>([]);
    const [newItem, setNewItem] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchOS = async () => {
            try {
                const res = await fetch(`/api/work-orders/${params.id}`);
                const data = await res.json();
                setOs(data);

                // Simple parsing for existing formatted notes
                const existingNotes = data.notes || "";
                if (existingNotes.includes("ITENS IDENTIFICADOS:")) {
                    const [rep, listPart] = existingNotes.split("ITENS IDENTIFICADOS:");
                    setReport(rep.replace("RELATÓRIO TÉCNICO:", "").trim());
                    const parsedItems = listPart
                        .split("\n")
                        .map((i: string) => i.replace(/^[•\-\*]\s*/, "").trim())
                        .filter((i: string) => i !== "");
                    setItems(parsedItems);
                } else {
                    setReport(existingNotes);
                }
            } catch (error) {
                console.error(error);
                alert("Erro ao carregar OS");
            } finally {
                setLoading(false);
            }
        };
        fetchOS();
    }, [params.id]);

    const handleAddItem = (e: React.FormEvent) => {
        e.preventDefault();
        if (newItem.trim()) {
            setItems([...items, newItem.trim()]);
            setNewItem("");
        }
    };

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleSaveDiagnosis = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            // Format combined notes
            let combinedNotes = "";
            if (report.trim()) {
                combinedNotes += `RELATÓRIO TÉCNICO:\n${report.trim()}\n\n`;
            }
            if (items.length > 0) {
                combinedNotes += `ITENS IDENTIFICADOS:\n${items.map(i => `• ${i}`).join("\n")}`;
            }

            // Update main OS notes
            await fetch(`/api/work-orders/${params.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notes: combinedNotes })
            });

            // Update Status to DIAGNOSTICO and add history log
            await fetch(`/api/work-orders/${params.id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    newStatus: 'DIAGNOSTICO',
                    notes: "Diagnóstico técnico atualizado no sistema."
                })
            });

            router.push(`/dashboard/work-orders/${params.id}`);
        } catch (error) {
            console.error(error);
            alert("Erro ao salvar diagnóstico");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-20 text-center animate-pulse text-indigo-500 font-bold uppercase tracking-widest">Carregando Dados...</div>;
    if (!os) return <div className="p-20 text-center text-red-500 font-bold">OS não encontrada</div>;

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-32">
            <div className="flex items-center gap-6 border-b border-slate-100 dark:border-gray-800 pb-8">
                <Link href={`/dashboard/work-orders/${params.id}`} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl dark:bg-gray-900 dark:hover:bg-gray-800 transition-all">
                    <ArrowLeft className="h-6 w-6 text-slate-400" />
                </Link>
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter flex items-center gap-3">
                        <ClipboardList className="h-8 w-8 text-indigo-600" />
                        Diagnóstico Técnico
                    </h1>
                    <p className="text-slate-500 dark:text-gray-400 font-bold mt-1">
                        OS #{os.code} • {os.customer.name} • {os.vehicle.brand} {os.vehicle.model}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left: Report */}
                <div className="bg-white dark:bg-gray-950 rounded-3xl border border-slate-100 dark:border-gray-900 p-8 shadow-sm space-y-6">
                    <div>
                        <h3 className="text-xs font-black text-slate-400 dark:text-gray-500 mb-4 uppercase tracking-[0.2em] flex items-center gap-2">
                            <FileText className="h-4 w-4" /> Relatório Técnico
                        </h3>
                        <textarea
                            value={report}
                            onChange={(e) => setReport(e.target.value)}
                            rows={15}
                            className="w-full p-6 border rounded-2xl bg-slate-50 dark:bg-gray-900 border-slate-100 dark:border-gray-800 text-slate-900 dark:text-white font-medium focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-slate-300"
                            placeholder="Descreva o resumo geral dos problemas encontrados..."
                        />
                    </div>
                </div>

                {/* Right: Items List */}
                <div className="bg-white dark:bg-gray-950 rounded-3xl border border-slate-100 dark:border-gray-900 p-8 shadow-sm space-y-6">
                    <div>
                        <h3 className="text-xs font-black text-slate-400 dark:text-gray-500 mb-4 uppercase tracking-[0.2em] flex items-center gap-2">
                            <ListChecks className="h-4 w-4" /> Itens Identificados
                        </h3>

                        {/* Quick Add Form */}
                        <form onSubmit={handleAddItem} className="flex gap-2 mb-6">
                            <input
                                type="text"
                                value={newItem}
                                onChange={(e) => setNewItem(e.target.value)}
                                className="flex-1 px-5 py-3 border rounded-xl bg-slate-50 dark:bg-gray-900 border-slate-100 dark:border-gray-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-400"
                                placeholder="Ex: Substituição das pastilhas..."
                            />
                            <button
                                type="submit"
                                disabled={!newItem.trim()}
                                className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg shadow-indigo-500/20"
                            >
                                <Plus className="h-5 w-5" />
                            </button>
                        </form>

                        {/* List display */}
                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {items.length === 0 ? (
                                <div className="text-center py-12 text-slate-300 dark:text-gray-600 italic text-sm font-medium border-2 border-dashed border-slate-50 dark:border-gray-900 rounded-2xl">
                                    Nenhum item listado ainda.
                                </div>
                            ) : (
                                items.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between group bg-slate-50 dark:bg-gray-900/50 p-4 rounded-xl border border-transparent hover:border-slate-100 dark:hover:border-gray-800 transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className="h-2 w-2 rounded-full bg-indigo-500"></div>
                                            <span className="text-sm font-bold text-slate-700 dark:text-gray-300">{item}</span>
                                        </div>
                                        <button
                                            onClick={() => removeItem(idx)}
                                            className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-4">
                <Link
                    href={`/dashboard/work-orders/${params.id}`}
                    className="px-8 py-3 border border-slate-100 text-slate-500 rounded-2xl hover:bg-slate-50 font-bold transition-all dark:border-gray-800 dark:hover:bg-gray-900"
                >
                    Cancelar
                </Link>
                <button
                    onClick={handleSaveDiagnosis}
                    disabled={saving || (!report.trim() && items.length === 0)}
                    className="px-8 py-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 font-black uppercase tracking-widest flex items-center gap-3 disabled:opacity-50 transition-all shadow-xl shadow-indigo-600/20"
                >
                    {saving ? (
                        <>Salvando...</>
                    ) : (
                        <>
                            <Save className="h-5 w-5" />
                            Concluir Diagnóstico
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
