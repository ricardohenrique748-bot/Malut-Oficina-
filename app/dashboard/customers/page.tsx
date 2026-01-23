"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, User, Pencil, Trash2, CalendarDays, Plus, Users, UserPlus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface Customer {
    id: string;
    name: string;
    document: string;
    phone: string;
    email: string;
    createdAt: string;
}

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const fetchCustomers = async (query = "") => {
        setLoading(true);
        try {
            const res = await fetch(`/api/customers?search=${query}`);
            const data = await res.json();
            setCustomers(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.document && c.document.includes(search)) ||
        (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
    );

    const totalCustomers = customers.length;
    const newCustomers30d = customers.filter(c => {
        const date = new Date(c.createdAt);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return date >= thirtyDaysAgo;
    }).length;

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
                        <Users className="h-8 w-8 text-indigo-600" />
                        Clientes
                    </h1>
                    <p className="text-gray-500">Gestão de base de dados e fidelização.</p>
                </div>
                <Link
                    href="/dashboard/customers/new"
                    className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white shadow-sm hover:bg-indigo-700 transition-all"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Cliente
                </Link>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-950 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-900 flex items-center gap-4">
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-indigo-600">
                        <Users className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Base de Clientes</p>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1">{totalCustomers}</h3>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-950 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-900 flex items-center gap-4">
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl text-green-600">
                        <UserPlus className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Novos (30 dias)</p>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1">{newCustomers30d}</h3>
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Nome, documento ou email..."
                    className="w-full bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-900 rounded-xl py-2.5 pl-10 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-gray-900 dark:text-white"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                    <button
                        onClick={() => setSearch("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-md transition-colors"
                    >
                        <X className="h-4 w-4 text-gray-400" />
                    </button>
                )}
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-950 rounded-2xl border border-gray-100 dark:border-gray-900 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50/50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 uppercase text-[10px] font-black tracking-widest">
                            <tr>
                                <th className="px-6 py-4">Cliente</th>
                                <th className="px-6 py-4">Documento</th>
                                <th className="px-6 py-4">Contato</th>
                                <th className="px-6 py-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-900">
                            {loading ? (
                                <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-400 font-bold uppercase tracking-widest animate-pulse">Sincronizando...</td></tr>
                            ) : filteredCustomers.length === 0 ? (
                                <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-400 italic">Nenhum cliente encontrado.</td></tr>
                            ) : (
                                filteredCustomers.map((customer) => (
                                    <tr key={customer.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/40 transition-colors group">
                                        <td className="px-6 py-4 font-bold text-gray-900 dark:text-white flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 font-black text-xs">
                                                {customer.name.charAt(0)}
                                            </div>
                                            {customer.name}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400 font-medium">
                                            {customer.document || "-"}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                            <div className="font-medium text-gray-700 dark:text-gray-300">{customer.email}</div>
                                            <div className="text-[10px] font-bold text-gray-400 uppercase mt-0.5">{customer.phone}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-1">
                                                <Link
                                                    href={`/dashboard/work-orders/new?customerId=${customer.id}`}
                                                    className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-all"
                                                    title="Nova OS / Agendar"
                                                >
                                                    <CalendarDays className="h-4 w-4" />
                                                </Link>
                                                <Link
                                                    href={`/dashboard/customers/${customer.id}`}
                                                    className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-all"
                                                    title="Editar"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Link>
                                                <button
                                                    onClick={async () => {
                                                        if (confirm("Tem certeza que deseja excluir este cliente? Toda a informação vinculada será perdida.")) {
                                                            await fetch(`/api/customers/${customer.id}`, { method: 'DELETE' });
                                                            fetchCustomers();
                                                        }
                                                    }}
                                                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all"
                                                    title="Excluir"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
