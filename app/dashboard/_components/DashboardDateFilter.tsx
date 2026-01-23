"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar, Filter, X } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

export function DashboardDateFilter() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    // View State
    const [mode, setMode] = useState<'MONTH' | 'RANGE'>(searchParams.get("from") ? 'RANGE' : 'MONTH');
    const [showRangePicker, setShowRangePicker] = useState(false);

    // Month Mode State
    const [month, setMonth] = useState(Number(searchParams.get("month")) || currentMonth);
    const [year, setYear] = useState(Number(searchParams.get("year")) || currentYear);

    // Range Mode State
    const [from, setFrom] = useState(searchParams.get("from") || format(new Date(), 'yyyy-MM-dd'));
    const [to, setTo] = useState(searchParams.get("to") || format(new Date(), 'yyyy-MM-dd'));

    const updateUrl = (params: Record<string, string | null>) => {
        const newParams = new URLSearchParams(searchParams.toString());
        Object.entries(params).forEach(([key, value]) => {
            if (value === null) newParams.delete(key);
            else newParams.set(key, value);
        });
        router.push(`${pathname}?${newParams.toString()}`);
    };

    const handleMonthChange = (newMonth: number, newYear: number) => {
        setMonth(newMonth);
        setYear(newYear);
        updateUrl({
            month: newMonth.toString(),
            year: newYear.toString(),
            from: null,
            to: null
        });
    };

    const handleRangeSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateUrl({
            from,
            to,
            month: null,
            year: null
        });
        setShowRangePicker(false);
    };

    const toggleMode = () => {
        if (mode === 'MONTH') {
            setMode('RANGE');
            setShowRangePicker(true);
        } else {
            setMode('MONTH');
            handleMonthChange(month, year);
        }
    };

    const nextMonth = () => {
        if (month === 12) handleMonthChange(1, year + 1);
        else handleMonthChange(month + 1, year);
    };

    const prevMonth = () => {
        if (month === 1) handleMonthChange(12, year - 1);
        else handleMonthChange(month - 1, year);
    };

    const reset = () => {
        setMode('MONTH');
        handleMonthChange(currentMonth, currentYear);
    };

    const monthDisplay = format(new Date(year, month - 1), 'MMMM yyyy', { locale: ptBR });

    return (
        <div className="relative flex items-center gap-2">
            {mode === 'MONTH' ? (
                <div className="flex items-center bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-900 rounded-xl px-1 shadow-sm transition-all hover:border-indigo-100">
                    <button onClick={prevMonth} className="p-2 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-lg text-gray-400">
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <div className="px-4 text-[10px] font-bold uppercase tracking-widest text-gray-600 dark:text-gray-300 min-w-[120px] text-center">
                        {monthDisplay}
                    </div>
                    <button onClick={nextMonth} className="p-2 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-lg text-gray-400">
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            ) : (
                <button
                    onClick={() => setShowRangePicker(true)}
                    className="flex items-center gap-3 bg-white dark:bg-gray-950 border border-indigo-100 dark:border-indigo-900 rounded-xl px-4 py-2 shadow-sm text-[10px] font-bold uppercase tracking-widest text-indigo-600"
                >
                    <Calendar className="h-4 w-4" />
                    {format(new Date(from), 'dd/MM/yy')} — {format(new Date(to), 'dd/MM/yy')}
                </button>
            )}

            <button
                onClick={toggleMode}
                title={mode === 'MONTH' ? "Filtrar por período" : "Voltar para mensal"}
                className={cn(
                    "p-2 rounded-xl border transition-all shadow-sm",
                    mode === 'RANGE'
                        ? "bg-indigo-600 border-indigo-600 text-white"
                        : "bg-white border-gray-100 text-gray-400 hover:text-indigo-600 hover:border-indigo-100 dark:bg-gray-950 dark:border-gray-900"
                )}
            >
                <Filter className="h-4 w-4" />
            </button>

            {mode === 'MONTH' && (month !== currentMonth || year !== currentYear) && (
                <button
                    onClick={reset}
                    className="ml-2 text-[10px] uppercase tracking-widest font-black text-indigo-500/40 hover:text-indigo-600 transition-colors"
                >
                    Hoje
                </button>
            )}

            {showRangePicker && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-gray-950 rounded-2xl border border-gray-100 dark:border-gray-900 p-8 shadow-2xl w-full max-w-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Definir Período</h3>
                            <button onClick={() => setShowRangePicker(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                                <X className="h-4 w-4 text-gray-400" />
                            </button>
                        </div>

                        <form onSubmit={handleRangeSubmit} className="space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 ml-1">Data Inicial</label>
                                    <input
                                        type="date"
                                        value={from}
                                        onChange={(e) => setFrom(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 ml-1">Data Final</label>
                                    <input
                                        type="date"
                                        value={to}
                                        onChange={(e) => setTo(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setMode('MONTH');
                                        setShowRangePicker(false);
                                    }}
                                    className="flex-1 px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-indigo-600 text-white rounded-xl px-4 py-3 text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all"
                                >
                                    Aplicar Filtro
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

