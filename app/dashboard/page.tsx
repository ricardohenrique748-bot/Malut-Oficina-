import { getAuthUser } from "@/lib/auth-utils";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AlertCircle, CalendarDays, CalendarRange, Package, Wrench, CheckCircle2, TrendingUp, ArrowRight, ShoppingBag, Plus, User, PieChart, Award, MessageSquare } from "lucide-react";
import { DashboardDateFilter } from "./_components/DashboardDateFilter";
import Link from "next/link";

async function getStats(searchParams: { month?: string, year?: string, from?: string, to?: string }) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Initial Boundaries
    let startDate: Date;
    let endDate: Date;

    if (searchParams.from && searchParams.to) {
        // Custom Period Mode
        startDate = new Date(searchParams.from);
        startDate.setHours(0, 0, 0, 0);

        endDate = new Date(searchParams.to);
        endDate.setHours(23, 59, 59, 999);
    } else {
        // Standard Month Mode
        const year = Number(searchParams?.year) || today.getFullYear();
        const month = Number(searchParams?.month) || (today.getMonth() + 1);

        startDate = new Date(year, month - 1, 1, 0, 0, 0, 0);
        endDate = new Date(year, month, 0, 23, 59, 59, 999);
    }

    // Start of week (Sunday)
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    try {
        // Execute all queries in parallel
        const [
            osOpen,
            appointmentsToday,
            appointmentsWeek,
            osTotal,
            forecastToday,
            forecastWeek,
            totalProducts,
            totalServices,
            salesTodayAgg,
            salesCountToday,
            salesMonthAgg
        ] = await Promise.all([
            // 1. OS em Aberto
            prisma.workOrder.count({
                where: {
                    status: { notIn: ['FINALIZADA', 'ENTREGUE'] },
                    vehicleId: { not: null as any }
                }
            }),
            // 2. Agendamentos Hoje
            prisma.workOrder.count({
                where: {
                    createdAt: { gte: today, lt: tomorrow },
                    vehicleId: { not: null as any },
                    status: { notIn: ['FINALIZADA', 'ENTREGUE'] }
                }
            }),
            // 3. Agendamentos Semana
            prisma.workOrder.count({
                where: {
                    createdAt: { gte: startOfWeek },
                    vehicleId: { not: null as any },
                    status: { notIn: ['FINALIZADA', 'ENTREGUE'] }
                }
            }),
            // 4. OS Total (Historical)
            prisma.workOrder.count({
                where: {
                    vehicleId: { not: null as any },
                    createdAt: { gte: startDate, lte: endDate }
                }
            }),
            // 5. Previsão de Retorno Hoje
            prisma.workOrder.count({
                where: {
                    status: 'EM_EXECUCAO',
                    vehicleId: { not: null as any }
                }
            }),
            // 6. Previsão de Retorno Semana
            prisma.workOrder.count({
                where: {
                    status: { in: ['EM_EXECUCAO', 'AGUARDANDO_APROVACAO'] },
                    vehicleId: { not: null as any }
                }
            }),
            // 7. Total Produtos
            prisma.part.count(),
            // 8. Total Serviços
            prisma.serviceCatalog.count(),
            // 9. Receita Hoje
            prisma.financialRecord.aggregate({
                _sum: { amount: true },
                where: {
                    createdAt: { gte: today, lt: tomorrow },
                    type: 'INCOME',
                    status: 'PAID'
                }
            }),
            // 10. Qtd Lançamentos de Receita Hoje
            prisma.financialRecord.count({
                where: {
                    createdAt: { gte: today, lt: tomorrow },
                    type: 'INCOME',
                    status: 'PAID'
                }
            }),
            // 11. Receita Período
            prisma.financialRecord.aggregate({
                _sum: { amount: true },
                where: {
                    createdAt: { gte: startDate, lte: endDate },
                    type: 'INCOME',
                    status: 'PAID'
                }
            })
        ]);

        const salesTodayValue = Number(salesTodayAgg._sum?.amount || 0);
        const salesMonthValue = Number(salesMonthAgg._sum?.amount || 0);

        return {
            osOpen,
            appointmentsToday,
            appointmentsWeek,
            osTotal,
            forecastToday,
            forecastWeek,
            totalProducts,
            totalServices,
            salesTodayValue,
            salesCountToday,
            salesMonthValue,
            mode: searchParams.from ? 'RANGE' : 'MONTH',
            error: null
        };
    } catch (e) {
        console.error("Erro ao buscar estatísticas do dashboard:", e);
        return {
            osOpen: 0,
            appointmentsToday: 0,
            appointmentsWeek: 0,
            osTotal: 0,
            forecastToday: 0,
            forecastWeek: 0,
            totalProducts: 0,
            totalServices: 0,
            salesTodayValue: 0,
            salesCountToday: 0,
            salesMonthValue: 0,
            mode: searchParams.from ? 'RANGE' : 'MONTH',
            error: "Erro de conexão com o banco de dados. Verifique as configurações (DATABASE_URL)."
        };
    }
}

export default async function DashboardPage({ searchParams }: { searchParams: { month?: string, year?: string, from?: string, to?: string } }) {
    const dbUser = await getAuthUser();

    if (!dbUser) {
        redirect("/auth/login");
    }

    const session = {
        user: {
            name: dbUser?.name || dbUser?.email?.split('@')[0],
            email: dbUser?.email,
        }
    };
    const stats = await getStats(searchParams);

    return (
        <div className="space-y-8 pb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                        Dashboard
                    </h1>
                    <div className="text-sm text-gray-500">
                        {new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                </div>
                <DashboardDateFilter />
            </div>

            {stats.error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3 animate-pulse">
                    <AlertCircle className="h-5 w-5" />
                    <span className="text-sm font-bold">{stats.error}</span>
                </div>
            )}

            {/* Minimalist Welcome Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-white border border-gray-100 p-8 shadow-sm dark:bg-gray-950 dark:border-gray-900">
                <div className="relative z-10">
                    <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white tracking-tight">Bem-vindo(a), {session?.user?.name}! 👋</h2>
                    <p className="text-gray-500 max-w-xl dark:text-gray-400 text-sm">
                        Resumo operacional da <span className="text-gray-900 dark:text-white font-semibold">Malut Oficina</span>.
                        Acompanhe seus indicadores e gerencie sua oficina com clareza.
                    </p>
                </div>
                <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-slate-50/50 blur-3xl dark:bg-slate-900/10"></div>
            </div>

            {/* Premium Grid: Primary KPI Section */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {/* 1. OS em Aberto */}
                <div className="relative overflow-hidden group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:bg-gray-950 dark:border-gray-900 transition-all hover:shadow-md hover:border-blue-100 dark:hover:border-blue-900/50">
                    <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-blue-50/50 blur-2xl group-hover:bg-blue-100/50 transition-colors"></div>
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <AlertCircle size={18} className="text-blue-600" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Ativas</span>
                        </div>
                        <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">{stats.osOpen}</h3>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-1">Ordens em Aberto</p>
                    </div>
                </div>

                {/* 2. Faturamento Hoje */}
                <div className="relative overflow-hidden group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:bg-gray-950 dark:border-gray-900 transition-all hover:shadow-md hover:border-green-100 dark:hover:border-green-900/50">
                    <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-green-50/50 blur-2xl group-hover:bg-green-100/50 transition-colors"></div>
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                <TrendingUp size={18} className="text-green-600" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-green-600">Hoje</span>
                        </div>
                        <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">
                            <span className="text-sm font-bold mr-1 opacity-40">R$</span>
                            {stats.salesTodayValue.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </h3>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-1">Receita do Dia</p>
                    </div>
                </div>

                {/* 3. Novas OS Hoje */}
                <div className="relative overflow-hidden group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:bg-gray-950 dark:border-gray-900 transition-all hover:shadow-md hover:border-orange-100 dark:hover:border-orange-900/50">
                    <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-orange-50/50 blur-2xl group-hover:bg-orange-100/50 transition-colors"></div>
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                                <CalendarDays size={18} className="text-orange-600" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-orange-600">Fluxo</span>
                        </div>
                        <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">{stats.appointmentsToday}</h3>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-1">Check-ins de Hoje</p>
                    </div>
                </div>

                {/* 4. Receita Período */}
                <div className="relative overflow-hidden group rounded-2xl border-2 border-indigo-600 bg-indigo-600 p-6 shadow-lg shadow-indigo-200 dark:shadow-none transition-all hover:scale-[1.02]">
                    <div className="absolute -right-2 -top-2 h-20 w-20 rounded-full bg-white/10 blur-xl"></div>
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-white/20 rounded-lg text-white">
                                <ShoppingBag size={18} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/70">Período</span>
                        </div>
                        <h3 className="text-3xl font-black text-white tracking-tighter">
                            <span className="text-sm font-bold mr-1 opacity-60">R$</span>
                            {stats.salesMonthValue.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </h3>
                        <p className="text-xs font-bold text-white/70 uppercase tracking-wider mt-1">Total do Mês</p>
                    </div>
                </div>
            </div>

            {/* Quick Actions & Secondary View */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Activity Feed / Monitor */}
                <div className="lg:col-span-2 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:bg-gray-950 dark:border-gray-900">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-gray-400">Atividade Operacional</h3>
                        <div className="flex items-center gap-2 px-2 py-1 bg-green-50 dark:bg-green-900/20 rounded-full">
                            <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-[10px] font-bold text-green-700 dark:text-green-400 uppercase tracking-wider">Ao Vivo</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-indigo-500"></div>
                                <span className="text-xs font-bold text-gray-600 dark:text-gray-400">Prontos p/ Entrega</span>
                            </div>
                            <span className="text-lg font-black text-gray-900 dark:text-white">{stats.forecastToday}</span>
                        </div>
                        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                                <span className="text-xs font-bold text-gray-600 dark:text-gray-400">Lançamentos Financeiros</span>
                            </div>
                            <span className="text-lg font-black text-gray-900 dark:text-white">{stats.salesCountToday}</span>
                        </div>
                        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-orange-500"></div>
                                <span className="text-xs font-bold text-gray-600 dark:text-gray-400">Produtos no Estoque</span>
                            </div>
                            <span className="text-lg font-black text-gray-900 dark:text-white">{stats.totalProducts}</span>
                        </div>
                        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                <span className="text-xs font-bold text-gray-600 dark:text-gray-400">Serviços Catálogo</span>
                            </div>
                            <span className="text-lg font-black text-gray-900 dark:text-white">{stats.totalServices}</span>
                        </div>
                    </div>
                </div>

                {/* Quick Actions Shortcuts */}
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:bg-gray-950 dark:border-gray-900 flex flex-col">
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-gray-400 mb-6">Ações Rápidas</h3>
                    <div className="flex-1 flex flex-col gap-3">
                        <Link
                            href="/dashboard/work-orders/new"
                            className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:border-indigo-200 hover:bg-white dark:hover:bg-gray-800 transition-all group"
                        >
                            <div className="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600">
                                <Plus size={16} />
                            </div>
                            <span className="text-xs font-bold text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 transition-colors">Nova Ordem de Serviço</span>
                            <ArrowRight size={14} className="ml-auto text-gray-300 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            href="/dashboard/reports/dre"
                            className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:border-indigo-200 hover:bg-white dark:hover:bg-gray-800 transition-all group"
                        >
                            <div className="h-8 w-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600">
                                <PieChart size={16} />
                            </div>
                            <span className="text-xs font-bold text-gray-700 dark:text-gray-300 group-hover:text-emerald-600 transition-colors">Relatório DRE (Lucro)</span>
                            <ArrowRight size={14} className="ml-auto text-gray-300 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            href="/dashboard/reports/commissions"
                            className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:border-indigo-200 hover:bg-white dark:hover:bg-gray-800 transition-all group"
                        >
                            <div className="h-8 w-8 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600">
                                <Award size={16} />
                            </div>
                            <span className="text-xs font-bold text-gray-700 dark:text-gray-300 group-hover:text-amber-600 transition-colors">Comissões & Equipe</span>
                            <ArrowRight size={14} className="ml-auto text-gray-300 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            href="/dashboard/crm/return-machine"
                            className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:border-indigo-200 hover:bg-white dark:hover:bg-gray-800 transition-all group"
                        >
                            <div className="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600">
                                <MessageSquare size={16} />
                            </div>
                            <span className="text-xs font-bold text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 transition-colors">Máquina de Retorno</span>
                            <ArrowRight size={14} className="ml-auto text-gray-300 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
