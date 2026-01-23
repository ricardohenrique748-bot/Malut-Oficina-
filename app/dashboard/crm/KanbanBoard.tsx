"use client";

import { useState } from "react";
import { ReactSortable } from "react-sortablejs";
import { updateLeadStatus } from "./actions";
import Link from "next/link";
import { format } from "date-fns";
import { DollarSign, TrendingUp, Calendar, ArrowRight, Ghost, Briefcase, Trash2 } from "lucide-react";
import { deleteLead } from "./actions";

interface Lead {
    id: string;
    nome: string;
    ramo: string | null;
    faturamentoRaw: string | null;
    investRaw: string | null;
    scorePotencial: number;
    tagsAi: string | null;
    createdAt: any;
}

interface Column {
    id: string;
    label: string;
    border: string;
}

const COLUMNS: Column[] = [
    { id: 'cold', label: 'Cold (0-10k)', border: 'border-slate-800' },
    { id: 'warm', label: 'Morno (10-50k)', border: 'border-orange-900/40' },
    { id: 'hot', label: 'Quente (50-200k)', border: 'border-blue-900/40' },
    { id: 'ultra_hot', label: 'Ultra Quente (200k+)', border: 'border-indigo-900/40' }
];

export default function KanbanBoard({ initialLeads }: { initialLeads: Record<string, Lead[]> }) {
    const [leads, setLeads] = useState(initialLeads);

    const handleSort = async (status: string, newList: Lead[]) => {
        // Only update if there are changes (handled by SortableJS)
        setLeads(prev => ({ ...prev, [status]: newList }));
    };

    const handleAdd = async (evt: any) => {
        const leadId = evt.item.getAttribute('data-id');
        const newStatus = evt.to.getAttribute('data-status');

        console.log(`[CRM] Moving lead ${leadId} to ${newStatus}`);

        if (leadId && newStatus) {
            const res = await updateLeadStatus(leadId, newStatus);
            if (!res.success) {
                alert("Erro ao atualizar status do lead no banco de dados.");
            }
        }
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-start overflow-x-auto pb-8 scrollbar-hide">
            {COLUMNS.map((col) => {
                const columnLeads = leads[col.id] || [];
                const isEmpty = columnLeads.length === 0;

                return (
                    <div key={col.id} className="flex flex-col gap-4 min-w-[300px]">
                        {/* Column Header */}
                        <div className="flex justify-between items-center px-4 py-3 bg-white/5 rounded-2xl border border-white/5">
                            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${col.id === 'cold' ? 'bg-slate-500' :
                                    col.id === 'warm' ? 'bg-orange-500' :
                                        col.id === 'hot' ? 'bg-blue-500' : 'bg-indigo-500'
                                    } shadow-[0_0_10px_rgba(0,0,0,0.2)]`}></span>
                                {col.label}
                            </h3>
                            <span className="bg-white/10 text-gray-600 dark:text-gray-300 text-[10px] font-bold px-2 py-1 rounded-md min-w-[1.5rem] text-center">
                                {columnLeads.length}
                            </span>
                        </div>

                        {/* Drop Zone */}
                        <div className="relative group/column">
                            {/* Empty State Background */}
                            {isEmpty && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400/20 pointer-events-none border-2 border-dashed border-gray-300/10 rounded-2xl m-2">
                                    <div className="p-4 rounded-full bg-white/5 mb-3">
                                        <Ghost className="w-8 h-8" />
                                    </div>
                                    <p className="text-xs font-medium uppercase tracking-widest">Wow, so empty</p>
                                </div>
                            )}

                            <ReactSortable
                                list={columnLeads}
                                setList={(newList) => handleSort(col.id, newList)}
                                group="leads"
                                animation={300}
                                onAdd={handleAdd}
                                ghostClass="kanban-ghost"
                                className={`min-h-[600px] space-y-3 p-2 rounded-2xl transition-all ${col.border} ${isEmpty ? 'bg-white/[0.02]' : ''}`}
                                data-status={col.id}
                            >
                                {columnLeads.map((lead) => {
                                    const tags = JSON.parse(lead.tagsAi || '[]');
                                    const score = lead.scorePotencial;

                                    // Dynamic Styling based on Score
                                    const isHot = score > 70;
                                    const cardBorder = isHot
                                        ? 'border-blue-500/30 shadow-[0_4px_20px_-10px_rgba(59,130,246,0.15)]'
                                        : 'border-white/5 hover:border-white/10';

                                    return (
                                        <div
                                            key={lead.id}
                                            data-id={lead.id}
                                            className={`bg-white dark:bg-[#0F172A] border ${cardBorder} p-5 rounded-2xl shadow-sm hover:shadow-xl cursor-grab active:cursor-grabbing hover:-translate-y-1 transition-all group relative overflow-hidden`}
                                        >
                                            {/* Top Row: Name and Score */}
                                            <div className="flex justify-between items-start mb-4 relative z-10">
                                                <div>
                                                    <h4 className="font-bold text-sm text-slate-900 dark:text-gray-100 leading-tight mb-1">{lead.nome}</h4>
                                                    <p className="text-[10px] text-slate-500 dark:text-gray-400 uppercase font-bold tracking-wider flex items-center gap-1.5">
                                                        <Briefcase className="w-3 h-3 text-slate-400" />
                                                        {lead.ramo || 'N/A'}
                                                    </p>
                                                </div>

                                                {/* Circular Score Badge */}
                                                <div className="relative w-10 h-10 flex items-center justify-center">
                                                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                                        <path
                                                            className="text-slate-100 dark:text-slate-800"
                                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth="4"
                                                        />
                                                        <path
                                                            className={`${score > 80 ? 'text-green-500' : score > 50 ? 'text-yellow-500' : 'text-red-500'}`}
                                                            strokeDasharray={`${score}, 100`}
                                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth="4"
                                                            strokeLinecap="round"
                                                        />
                                                    </svg>
                                                    <span className="absolute text-[9px] font-black">{score}</span>
                                                </div>
                                            </div>

                                            {/* Metrics Grid */}
                                            <div className="grid grid-cols-2 gap-3 mb-4 bg-slate-50/50 dark:bg-black/20 p-3 rounded-xl border border-slate-100 dark:border-white/5">
                                                <div className="space-y-1">
                                                    <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                                                        <DollarSign className="w-2.5 h-2.5" />
                                                        Faturamento
                                                    </p>
                                                    <p className="text-[10px] font-bold text-slate-700 dark:text-slate-200 truncate">
                                                        {lead.faturamentoRaw || '-'}
                                                    </p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                                                        <TrendingUp className="w-2.5 h-2.5" />
                                                        Investimento
                                                    </p>
                                                    <p className="text-[10px] font-bold text-slate-700 dark:text-slate-200 truncate">
                                                        {lead.investRaw || '-'}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Tags */}
                                            <div className="flex flex-wrap gap-1.5 mb-4 max-h-[60px] overflow-hidden relative">
                                                {tags.slice(0, 3).map((tag: string) => (
                                                    <span key={tag} className="text-[9px] font-bold px-2 py-1 bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 rounded-md border border-blue-100 dark:border-blue-500/10 flex items-center gap-1">
                                                        <span className="w-1 h-1 rounded-full bg-blue-400"></span>
                                                        {tag}
                                                    </span>
                                                ))}
                                                {tags.length > 3 && (
                                                    <span className="text-[9px] font-bold px-2 py-1 text-slate-400">+ {tags.length - 3}</span>
                                                )}
                                            </div>

                                            {/* Footer */}
                                            <div className="pt-3 flex items-center justify-between border-t border-slate-100 dark:border-white/5">
                                                <div className="flex gap-2">
                                                    <Link
                                                        href={`/dashboard/crm/${lead.id}`}
                                                        className="group/link flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-blue-500 transition-colors"
                                                    >
                                                        Ver Detalhes
                                                        <ArrowRight className="w-3 h-3 transition-transform group-hover/link:translate-x-0.5" />
                                                    </Link>
                                                    <button
                                                        onClick={async (e) => {
                                                            e.stopPropagation();
                                                            if (confirm('Tem certeza que deseja excluir este lead?')) {
                                                                // Optimistic update could go here, but for now we rely on server revalidation
                                                                await deleteLead(lead.id);
                                                            }
                                                        }}
                                                        className="text-slate-400 hover:text-red-500 transition-colors"
                                                        title="Excluir Lead"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                                <span className="flex items-center gap-1 text-[9px] text-slate-400 font-medium">
                                                    <Calendar className="w-3 h-3" />
                                                    {format(new Date(lead.createdAt), 'dd MMM')}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </ReactSortable>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
