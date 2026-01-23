import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";
import { reanalyzeLead } from "../actions";

export default async function LeadDetailPage({ params }: { params: { id: string } }) {
    const lead = await prisma.lead.findUnique({
        where: { id: params.id },
    });

    if (!lead) notFound();

    const tags = JSON.parse(lead.tagsAi || "[]") as string[];
    const score = lead.scorePotencial;

    const handleReanalyze = async () => {
        "use server";
        await reanalyzeLead(params.id);
    };

    return (
        <div className="max-w-6xl mx-auto p-8 lg:p-12 animate-in fade-in duration-700">
            <nav className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-6">
                    <Link href="/dashboard/crm" className="p-3 hover:bg-white/5 rounded-2xl transition-colors text-gray-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    </Link>
                    <h1 className="text-2xl font-black tracking-tight uppercase text-slate-900 dark:text-white">Lead <span className="text-blue-600">Details</span></h1>
                </div>

                <form action={handleReanalyze}>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-600/20 transition-all flex items-center gap-3">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                        Reanalisar IA
                    </button>
                </form>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                {/* Left: Core Info */}
                <div className="lg:col-span-2 space-y-16">
                    {/* Profile Header */}
                    <div className="flex items-start gap-10">
                        <div className="h-28 w-28 bg-blue-600/10 border border-blue-500/20 rounded-[2.5rem] flex items-center justify-center text-blue-500 text-5xl font-black">
                            {lead.nome[0].toUpperCase()}
                        </div>
                        <div className="space-y-6">
                            <h2 className="text-5xl font-extrabold tracking-tighter text-slate-900 dark:text-white">{lead.nome}</h2>
                            <div className="flex flex-wrap gap-6 text-sm text-gray-500 font-medium">
                                <span className="flex items-center gap-3">
                                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                    {lead.email}
                                </span>
                                <span className="flex items-center gap-3">
                                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                                    {lead.telefone}
                                </span>
                                <span className="flex items-center gap-3">
                                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                                    {lead.instagram}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Responses Section */}
                    <div className="space-y-10">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-600 border-l-4 border-blue-600 pl-4">Respostas do Quiz</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {[
                                { label: 'Ramo', val: lead.ramo },
                                { label: 'Faturamento', val: lead.faturamentoRaw },
                                { label: 'Investimento', val: lead.investRaw },
                                { label: 'Objetivo', val: lead.objetivo },
                                { label: 'Já investe?', val: lead.fazTrafego }
                            ].map((item, i) => (
                                <div key={i} className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 p-8 rounded-[2rem] space-y-3 hover:border-blue-500/20 transition-colors group">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-500 group-hover:text-blue-600 transition-colors">{item.label}</p>
                                    <p className="text-lg font-bold text-slate-900 dark:text-gray-100">{item.val || '—'}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: AI Qualification Sidebar */}
                <div className="space-y-10">
                    <div className="bg-blue-600 p-10 rounded-[3.5rem] shadow-[0_30px_60px_-15px_rgba(37,99,235,0.4)] space-y-10 relative overflow-hidden group">
                        <div className="absolute -right-6 -top-6 opacity-10 group-hover:scale-110 transition-transform duration-700">
                            <svg className="w-40 h-40" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71L12 2z"></path></svg>
                        </div>

                        <div className="space-y-3 relative z-10">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-200">AI Qualification Score</h3>
                            <div className="flex items-baseline gap-2">
                                <span className="text-7xl font-black">{score}</span>
                                <span className="text-blue-200 font-bold text-2xl">%</span>
                            </div>
                        </div>

                        <div className="space-y-8 relative z-10">
                            <div className="space-y-1">
                                <p className="text-[8px] font-black uppercase tracking-widest text-blue-200">Urgência</p>
                                <p className="text-2xl font-black capitalize">{lead.urgencia}</p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-[8px] font-black uppercase tracking-widest text-blue-200">Categoria Financeira</p>
                                <p className="text-2xl font-black">{lead.faturamentoCategoria}</p>
                            </div>
                        </div>

                        <div className="pt-10 border-t border-white/20 relative z-10">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-200 mb-6">Insights Estratégicos</h4>
                            <div className="flex flex-wrap gap-2.5">
                                {tags.map((tag, i) => (
                                    <span key={i} className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/5 border border-white/5 p-10 rounded-[3rem] space-y-6 hover:border-blue-500/10 transition-colors">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Resumo da IA</h3>
                        <p className="text-sm text-slate-600 dark:text-gray-400 leading-relaxed font-medium italic">
                            "{lead.resumoAi}"
                        </p>
                        <div className="pt-4">
                            <p className="text-[8px] text-gray-600 font-black uppercase tracking-[0.2em] italic">Gerado via Gemini 1.5 Flash</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
