"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Car, User } from "lucide-react";

export default function VehiclesPage() {
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const fetchVehicles = async (query = "") => {
        setLoading(true);
        try {
            const res = await fetch(`/api/vehicles?search=${query}`);
            const data = await res.json();
            setVehicles(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVehicles();
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchVehicles(search);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Veículos</h1>
                    <p className="text-gray-500">Listagem geral de veículos da oficina.</p>
                </div>
                {/* No "New Vehicle" button here because it's tied to Customer. 
            Maybe link to Customers list advising to add there. */}
                <Link
                    href="/dashboard/customers"
                    className="text-sm text-indigo-600 hover:underline"
                >
                    Para adicionar um veículo, vá em Clientes
                </Link>
            </div>

            <div className="flex gap-2">
                <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Buscar por placa, modelo ou marca..."
                            className="w-full rounded-md border border-gray-300 bg-white py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200">
                        Buscar
                    </button>
                </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading ? (
                    <div>Carregando...</div>
                ) : vehicles.length === 0 ? (
                    <div className="col-span-3 text-center py-10 bg-white rounded text-gray-500">Nenhum veículo encontrado.</div>
                ) : (
                    vehicles.map((v) => (
                        <Link
                            key={v.id}
                            href={`/dashboard/customers/${v.customerId}`}
                            className="block bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 hover:border-indigo-400 transition p-4"
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-indigo-50 rounded-full">
                                    <Car className="h-5 w-5 text-indigo-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white">{v.brand} {v.model}</h3>
                                    <p className="text-xs text-gray-500 font-mono bg-gray-100 px-1 rounded inline-block">{v.plate}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 mt-2 border-t pt-2">
                                <User className="h-3 w-3" />
                                <span>{v.customer.name}</span>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}
