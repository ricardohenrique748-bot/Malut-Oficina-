"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard,
    LogOut,
    Menu,
    X,
    UserPlus,
    Users,
    ShoppingCart,
    Wrench,
    Package,
    Wallet,
    Settings,
    MessageCircle
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

export function Sidebar({ dbUser }: { dbUser: any }) {
    const pathname = usePathname();
    const router = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push("/auth/login");
    };

    const role = dbUser?.role?.name || dbUser?.user_metadata?.role;

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'RECEPCAO', 'MECANICO', 'FINANCEIRO', 'GERENTE'] },
        { name: 'Cadastrar Cliente', href: '/dashboard/customers/new', icon: UserPlus, roles: ['ADMIN', 'RECEPCAO', 'GERENTE'] },
        { name: 'Clientes', href: '/dashboard/customers', icon: Users, roles: ['ADMIN', 'RECEPCAO', 'GERENTE'] },
        { name: 'Vendas', href: '/dashboard/pdv', icon: ShoppingCart, roles: ['ADMIN', 'RECEPCAO', 'GERENTE'] },
        { name: 'CRM', href: '/dashboard/crm', icon: LayoutDashboard, roles: ['ADMIN', 'GERENTE'] },

        { name: 'Ordens de Serviço', href: '/dashboard/work-orders', icon: Wrench, roles: ['ADMIN', 'RECEPCAO', 'MECANICO', 'GERENTE'] },
        { name: 'Estoque', href: '/dashboard/inventory', icon: Package, roles: ['ADMIN', 'RECEPCAO', 'MECANICO', 'GERENTE'] },
        { name: 'Financeiro', href: '/dashboard/financial', icon: Wallet, roles: ['ADMIN', 'FINANCEIRO', 'GERENTE'] },
        { name: 'Equipe', href: '/dashboard/staff', icon: Users, roles: ['ADMIN'] },
        { name: 'Integrações', href: '/dashboard/settings/integrations', icon: Settings, roles: ['ADMIN', 'GERENTE'] },
        { name: 'WhatsApp', href: '/dashboard/settings/whatsapp', icon: MessageCircle, roles: ['ADMIN'] },
    ];

    const filteredNav = navigation.filter(item => item.roles.includes(role || ''));

    return (
        <aside className={cn(
            "fixed inset-y-0 left-0 z-40 w-72 bg-gradient-to-br from-indigo-600 via-[#2020d8] to-[#0f0f70] text-white border-r border-white/10 shadow-[20px_0_80px_-15px_rgba(0,0,0,0.4)] transition-transform duration-500 transform lg:static lg:translate-x-0 overflow-hidden",
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
            {/* Mobile toggle button inside sidebar (only visible when open) */}
            <div className="lg:hidden absolute top-4 right-4 z-50">
                <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-white/50 hover:text-white transition-colors">
                    <X />
                </button>
            </div>

            {/* Mobile toggle button - Visible when sidebar is closed */}
            {!isSidebarOpen && (
                <div className="lg:hidden fixed top-0 left-0 p-4 z-50">
                    <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-indigo-900 text-white rounded shadow-lg">
                        <Menu />
                    </button>
                </div>
            )}

            <div className="absolute inset-0 bg-white/[0.03] backdrop-blur-3xl -z-10"></div>

            <div className="flex flex-col h-full relative z-10">
                <div className="h-16 flex items-center px-8">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-white rounded-lg flex items-center justify-center shadow-lg shadow-white/10">
                            <div className="h-4 w-4 bg-[#2020d8] rounded-sm"></div>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 px-4 py-2 space-y-4 overflow-y-auto custom-scrollbar">
                    <div className="space-y-1">
                        <p className="px-4 text-[10px] font-black uppercase tracking-[0.3em] text-white/50 mb-2">Principal</p>
                        {filteredNav.slice(0, 5).map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 group relative",
                                        isActive
                                            ? "bg-white/20 text-white shadow-lg shadow-black/10"
                                            : "text-white/80 hover:text-white hover:bg-white/10"
                                    )}
                                >
                                    {isActive && <div className="absolute left-0 w-1.5 h-6 bg-white rounded-full -translate-x-1 shadow-[0_0_15px_rgba(255,255,255,0.5)]"></div>}
                                    <item.icon className={cn(
                                        "h-5 w-5 mr-3 transition-transform duration-300",
                                        isActive ? "text-white scale-110" : "text-white/50 group-hover:scale-110 group-hover:text-white"
                                    )} />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </div>

                    <div className="space-y-1">
                        <p className="px-4 text-[10px] font-black uppercase tracking-[0.3em] text-white/50 mb-2">Operacional</p>
                        {filteredNav.slice(5).map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 group relative",
                                        isActive
                                            ? "bg-white/20 text-white shadow-lg shadow-black/10"
                                            : "text-white/80 hover:text-white hover:bg-white/10"
                                    )}
                                >
                                    {isActive && <div className="absolute left-0 w-1.5 h-6 bg-white rounded-full -translate-x-1 shadow-[0_0_15px_rgba(255,255,255,0.5)]"></div>}
                                    <item.icon className={cn(
                                        "h-5 w-5 mr-3 transition-transform duration-300",
                                        isActive ? "text-white scale-110" : "text-white/50 group-hover:scale-110 group-hover:text-white"
                                    )} />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </div>
                </nav>

                <div className="p-4 m-3 mt-auto bg-black/20 rounded-[1.5rem] border border-white/10 backdrop-blur-md">
                    <div className="flex items-center mb-4">
                        <div className="h-8 w-8 rounded-lg bg-white/20 border border-white/30 flex items-center justify-center text-white font-black text-sm shadow-xl">
                            {dbUser?.name?.charAt(0) || dbUser?.email?.charAt(0)}
                        </div>
                        <div className="ml-3">
                            <p className="text-[13px] font-black text-white tracking-tight leading-none uppercase">{dbUser?.name || 'Administrador'}</p>
                            <p className="text-[10px] text-white/60 font-black uppercase tracking-widest mt-1.5">{role}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleSignOut}
                        className="flex w-full items-center justify-center p-3 text-[10px] font-black uppercase tracking-[0.2em] text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all border border-white/10 group"
                    >
                        <LogOut className="h-4 w-4 mr-2 transition-transform group-hover:translate-x-0.5" /> Sair
                    </button>
                </div>
            </div>
        </aside>
    );
}
