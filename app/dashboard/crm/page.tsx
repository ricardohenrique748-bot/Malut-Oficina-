import { prisma } from "@/lib/prisma";
import KanbanBoard from "./KanbanBoard";
import { Users, Zap, Wallet } from "lucide-react";

export const metadata = {
    title: "CRM Dashboard | Malut Admin",
};

export default async function CRMPage() {
    const allLeads = await prisma.lead.findMany({
        orderBy: { createdAt: "desc" },
    });

    // Group leads by status
    const groupedLeads: any = {
        cold: [],
        warm: [],
        hot: [],
        ultra_hot: [],
    };

    allLeads.forEach((lead: any) => {
        const status = lead.statusKanban || "cold";
        if (groupedLeads[status]) {
            groupedLeads[status].push({
                ...lead,
                createdAt: lead.createdAt.toISOString(),
                updatedAt: lead.updatedAt.toISOString(),
            });
        }
    });

    return (
        <div className="p-8">
            {/* Header Section */}
            {/* Header Section */}
            <div className="flex flex-col xl:flex-row justify-between xl:items-end gap-8 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-8 w-1 bg-blue-500 rounded-full"></div>
                        <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">Lead Pipeline</h2>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium max-w-xl leading-relaxed">
                        Gerencie o fluxo de qualificação inteligente dos seus leads.
                        Acompanhe o progresso desde o primeiro contato até o fechamento.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    {/* Metric 1: Total Leads */}
                    <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 px-6 py-4 rounded-2xl flex items-center gap-4 shadow-sm">
                        <div className="p-3 bg-blue-50 dark:bg-blue-500/20 rounded-xl">
                            <Users className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase font-black tracking-widest text-gray-400">Total Leads</p>
                            <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{allLeads.length}</p>
                        </div>
                    </div>

                    {/* Metric 2: Hot Leads */}
                    <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 px-6 py-4 rounded-2xl flex items-center gap-4 shadow-sm">
                        <div className="p-3 bg-orange-50 dark:bg-orange-500/20 rounded-xl">
                            <Zap className="w-5 h-5 text-orange-500" />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase font-black tracking-widest text-gray-400">Alta Prioridade</p>
                            <p className="text-xl font-bold text-slate-800 dark:text-slate-100">
                                {allLeads.filter((l: any) => l.scorePotencial > 70).length}
                            </p>
                        </div>
                    </div>

                    {/* AI Status Badge */}
                    <div className="bg-slate-900 dark:bg-white/10 border border-slate-800 dark:border-white/10 px-6 py-4 rounded-2xl flex items-center gap-4 shadow-lg">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                        </span>
                        <div>
                            <p className="text-[9px] uppercase font-black tracking-[0.2em] text-emerald-400">AI Qualification</p>
                            <p className="text-xs font-bold text-white">Sistema Ativo</p>
                        </div>
                    </div>
                </div>
            </div>

            <KanbanBoard initialLeads={groupedLeads} />
        </div>
    );
}
