"use client";

import { useState, useEffect } from "react";
import { Users, UserPlus, Shield, CheckCircle, XCircle, Loader2, ArrowRight, Trash2 } from "lucide-react";
import Link from "next/link";
import { deleteUser } from "@/app/actions/user-actions";

export default function StaffListPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStaff = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/staff');
            if (res.ok) {
                const json = await res.json();
                setData(json);
            } else {
                console.error("Failed to fetch staff:", res.status, res.statusText);
                setError("Falha ao carregar equipe. Tente novamente.");
            }
        } catch (e) {
            console.error("Fetch error:", e);
            setError("Erro de conexão.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStaff();
    }, []);

    const handleDelete = async (userId: string) => {
        if (confirm("Tem certeza que deseja excluir este funcionário? Esta ação não pode ser desfeita.")) {
            try {
                const result = await deleteUser(userId);
                if (result.success) {
                    setData((prev: any) => ({
                        ...prev,
                        users: prev.users.filter((u: any) => u.id !== userId)
                    }));
                } else {
                    alert(result.message || "Erro ao excluir usuário.");
                }
            } catch (error) {
                console.error(error);
                alert("Erro ao excluir usuário.");
            }
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-screen">
            <Loader2 className="h-10 w-10 text-indigo-500 animate-spin mb-4" />
            <p className="text-gray-400 font-medium tracking-widest uppercase text-xs">Carregando Equipe...</p>
        </div>
    );

    if (error) return (
        <div className="flex flex-col items-center justify-center h-screen text-red-500">
            <p className="font-bold mb-2">Erro ao carregar</p>
            <p className="text-sm">{error}</p>
            <button onClick={fetchStaff} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg">Tentar Novamente</button>
        </div>
    );

    return (
        <div className="space-y-8 max-w-6xl mx-auto pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight">Gestão de Equipe</h1>
                    <p className="text-gray-500 text-sm font-medium">Controle de acessos, cargos e comissões da oficina.</p>
                </div>
                <Link
                    href="/dashboard/staff/new"
                    className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 dark:shadow-none transition flex items-center justify-center gap-2 active:scale-95"
                >
                    <UserPlus className="h-4 w-4" />
                    Novo Funcionário
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data?.users?.map((user: any) => (
                    <div key={user.id} className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all group overflow-hidden relative">
                        {/* Status Decoration */}
                        <div className={`absolute top-0 right-0 w-24 h-24 -mr-12 -mt-12 rounded-full blur-3xl opacity-20 ${user.active ? 'bg-emerald-500' : 'bg-red-500'}`}></div>

                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 bg-gray-50 dark:bg-gray-900 rounded-2xl flex items-center justify-center text-2xl font-black text-gray-400 border border-gray-100 dark:border-gray-800 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-500">
                                {user.name.charAt(0)}
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-gray-900 dark:text-white group-hover:text-indigo-600 transition-colors">{user.name}</h3>
                                <div className="flex items-center gap-1.5 mt-1">
                                    <Shield className="h-3 w-3 text-indigo-500" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{user.role?.name}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 mb-8">
                            <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border border-gray-50 dark:border-gray-800">
                                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">E-mail</p>
                                <p className="text-sm font-bold text-gray-700 dark:text-gray-300 truncate">{user.email}</p>
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-1 bg-indigo-50/50 dark:bg-indigo-900/10 p-4 rounded-2xl border border-indigo-50 dark:border-indigo-900/20">
                                    <p className="text-[10px] font-black uppercase text-indigo-400 tracking-widest mb-1">Comissão</p>
                                    <p className="text-xl font-black text-indigo-600">{Number(user.commissionRate || 0)}%</p>
                                </div>
                                <div className="flex-1 bg-gray-50 dark:bg-gray-900 p-4 rounded-2xl flex items-center justify-center border border-gray-50 dark:border-gray-800">
                                    {user.active ? (
                                        <div className="flex flex-col items-center">
                                            <CheckCircle className="h-5 w-5 text-emerald-500 mb-1" />
                                            <span className="text-[8px] font-black uppercase text-emerald-600">Ativo</span>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center">
                                            <XCircle className="h-5 w-5 text-red-500 mb-1" />
                                            <span className="text-[8px] font-black uppercase text-red-600">Inativo</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Link
                                href={`/dashboard/staff/edit/${user.id}`}
                                className="flex-1 h-14 bg-gray-900 dark:bg-white dark:text-gray-900 text-white rounded-2xl flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-black/10"
                            >
                                Editar Cadastro
                                <ArrowRight size={14} />
                            </Link>
                            <button
                                onClick={() => handleDelete(user.id)}
                                className="h-14 w-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm hover:shadow-xl hover:shadow-red-500/20 active:scale-95"
                                title="Excluir funcionário"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
