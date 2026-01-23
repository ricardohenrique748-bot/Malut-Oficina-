"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Shield, Mail, Lock, User, Percent, ArrowLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";

export default function StaffFormPage({ params }: { params?: { id: string } }) {
    const router = useRouter();
    const isEdit = !!params?.id;
    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);
    const [roles, setRoles] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        roleId: "",
        commissionRate: "0",
        active: true
    });

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const res = await fetch('/api/staff');
                if (res.ok) {
                    const json = await res.json();
                    setRoles(json.roles);

                    if (isEdit) {
                        const user = json.users.find((u: any) => u.id === params.id);
                        if (user) {
                            setFormData({
                                name: user.name,
                                email: user.email,
                                password: "", // Don't load password
                                roleId: user.roleId,
                                commissionRate: user.commissionRate?.toString() || "0",
                                active: user.active
                            });
                        }
                    } else if (json.roles.length > 0) {
                        // Default to MECANICO if available
                        const mechRole = json.roles.find((r: any) => r.name === 'MECANICO');
                        setFormData(prev => ({ ...prev, roleId: mechRole?.id || json.roles[0].id }));
                    }
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        loadInitialData();
    }, [isEdit, params?.id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch('/api/staff', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: params?.id,
                    ...formData,
                    commissionRate: parseFloat(formData.commissionRate)
                })
            });

            if (res.ok) {
                router.push('/dashboard/staff');
                router.refresh();
            } else {
                alert("Erro ao salvar funcionário.");
            }
        } catch (e) {
            alert("Erro ao conectar com o servidor.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-screen">
            <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
        </div>
    );

    return (
        <div className="max-w-2xl mx-auto pb-20">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/dashboard/staff" className="p-3 bg-white dark:bg-gray-800 rounded-2xl hover:bg-gray-50 transition-all border border-gray-100 dark:border-gray-700">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="text-3xl font-black tracking-tight">{isEdit ? 'Editar Funcionário' : 'Novo Funcionário'}</h1>
                    <p className="text-gray-500 text-sm font-medium">Configure os dados de acesso e remuneração.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-sm border border-gray-50 dark:border-gray-700 space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-full">
                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1 mb-2 block">Nome Completo</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-4 h-5 w-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                                <input
                                    required
                                    type="text"
                                    className="w-full bg-gray-50 dark:bg-gray-900/50 border-none rounded-2xl py-4 pl-12 pr-4 font-bold text-gray-800 dark:text-white placeholder:text-gray-300 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                                    placeholder="Ex: João da Silva"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1 mb-2 block">E-mail de Acesso</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-4 h-5 w-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                                <input
                                    required
                                    type="email"
                                    className="w-full bg-gray-50 dark:bg-gray-900/50 border-none rounded-2xl py-4 pl-12 pr-4 font-bold text-gray-800 dark:text-white placeholder:text-gray-300 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                                    placeholder="joao@oficina.com"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1 mb-2 block">{isEdit ? 'Nova Senha (opcional)' : 'Senha Inicial'}</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-4 h-5 w-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                                <input
                                    required={!isEdit}
                                    type="password"
                                    className="w-full bg-gray-50 dark:bg-gray-900/50 border-none rounded-2xl py-4 pl-12 pr-4 font-bold text-gray-800 dark:text-white placeholder:text-gray-300 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <hr className="border-gray-50 dark:border-gray-700" />

                    {/* Role & Commission */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1 mb-2 block">Cargo / Função</label>
                            <div className="relative group">
                                <Shield className="absolute left-4 top-4 h-5 w-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                                <select
                                    className="w-full bg-gray-50 dark:bg-gray-900/50 border-none rounded-2xl py-4 pl-12 pr-4 font-bold text-gray-800 dark:text-white appearance-none focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                                    value={formData.roleId}
                                    onChange={e => setFormData({ ...formData, roleId: e.target.value })}
                                >
                                    {roles.map(r => (
                                        <option key={r.id} value={r.id}>{r.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1 mb-2 block">Taxa de Comissão (%)</label>
                            <div className="relative group">
                                <Percent className="absolute left-4 top-4 h-5 w-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                                <input
                                    required
                                    type="number"
                                    step="0.1"
                                    className="w-full bg-gray-50 dark:bg-gray-900/50 border-none rounded-2xl py-4 pl-12 pr-4 font-bold text-gray-800 dark:text-white placeholder:text-gray-300 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                                    placeholder="40"
                                    value={formData.commissionRate}
                                    onChange={e => setFormData({ ...formData, commissionRate: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {isEdit && (
                        <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl">
                            <input
                                type="checkbox"
                                id="active"
                                className="w-5 h-5 rounded-lg accent-indigo-600"
                                checked={formData.active}
                                onChange={e => setFormData({ ...formData, active: e.target.checked })}
                            />
                            <label htmlFor="active" className="text-sm font-black uppercase tracking-widest text-gray-600 dark:text-gray-400">Usuário Ativo</label>
                        </div>
                    )}
                </div>

                <button
                    disabled={saving}
                    type="submit"
                    className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black uppercase tracking-widest hover:bg-indigo-700 shadow-2xl shadow-indigo-100 dark:shadow-none transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                >
                    {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                    {isEdit ? 'Salvar Alterações' : 'Finalizar Cadastro'}
                </button>
            </form>
        </div>
    );
}
