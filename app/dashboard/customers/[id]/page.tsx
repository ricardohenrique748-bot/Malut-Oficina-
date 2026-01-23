"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Car, Save, Plus, AlertCircle, Trash2 } from "lucide-react";

interface Vehicle {
    id: string;
    plate: string;
    brand: string;
    model: string;
    color: string | null;
    year: number | null;
}

interface Customer {
    id: string;
    name: string;
    document: string;
    phone: string;
    email: string;
    address: string;
    vehicles: Vehicle[];
}

export default function CustomerDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [loading, setLoading] = useState(true);

    // Vehicle Form State
    const [showVehicleForm, setShowVehicleForm] = useState(false);
    const [newVehicle, setNewVehicle] = useState({
        plate: "", brand: "", model: "", color: "", year: ""
    });
    const [vehicleLoading, setVehicleLoading] = useState(false);

    const fetchCustomer = async () => {
        try {
            const res = await fetch(`/api/customers/${params.id}`);
            if (res.ok) {
                const data = await res.json();
                setCustomer(data);
            } else {
                alert("Cliente não encontrado");
                router.push("/dashboard/customers");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomer();
    }, [params.id]);

    const handleUpdateCustomer = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!customer) return;
        try {
            await fetch(`/api/customers/${customer.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: customer.name,
                    document: customer.document,
                    phone: customer.phone,
                    email: customer.email,
                    address: customer.address
                })
            });
            alert("Cliente atualizado!");
        } catch (err) {
            alert("Erro ao atualizar");
        }
    };

    const handleCreateVehicle = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!customer) return;
        setVehicleLoading(true);

        try {
            const res = await fetch("/api/vehicles", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...newVehicle,
                    customerId: customer.id
                })
            });

            if (res.ok) {
                setNewVehicle({ plate: "", brand: "", model: "", color: "", year: "" });
                setShowVehicleForm(false);
                fetchCustomer(); // Reload list
            } else {
                alert("Erro ao criar veículo. Verifique se a placa já existe.");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setVehicleLoading(false);
        }
    };

    if (loading) return <div>Carregando...</div>;
    if (!customer) return <div>Cliente não encontrado</div>;

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/customers" className="p-2 hover:bg-gray-100 rounded-full dark:hover:bg-gray-800">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <h1 className="text-2xl font-bold tracking-tight">Detalhes do Cliente</h1>
                <button
                    onClick={async () => {
                        if (confirm("Tem certeza que deseja excluir este cliente? Isso removerá todos os veículos e OS associadas.")) {
                            await fetch(`/api/customers/${customer.id}`, { method: 'DELETE' });
                            router.push('/dashboard/customers');
                        }
                    }}
                    className="ml-auto px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm font-bold"
                >
                    Excluir Cliente
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Info Card */}
                <div className="rounded-lg border bg-white shadow dark:bg-gray-800 dark:border-gray-700 h-fit">
                    <div className="p-6 border-b dark:border-gray-700">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <span className="p-1 bg-indigo-100 text-indigo-600 rounded">Info</span>
                            Dados Pessoais
                        </h2>
                    </div>
                    <div className="p-6">
                        <form onSubmit={handleUpdateCustomer} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium">Nome</label>
                                <input
                                    value={customer.name}
                                    onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                                    className="w-full border rounded p-2 dark:bg-gray-900"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-sm font-medium">Documento</label>
                                    <input
                                        value={customer.document || ""}
                                        onChange={(e) => setCustomer({ ...customer, document: e.target.value })}
                                        className="w-full border rounded p-2 dark:bg-gray-900"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Telefone</label>
                                    <input
                                        value={customer.phone || ""}
                                        onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                                        className="w-full border rounded p-2 dark:bg-gray-900"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Email</label>
                                <input
                                    value={customer.email || ""}
                                    onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                                    className="w-full border rounded p-2 dark:bg-gray-900"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Endereço</label>
                                <textarea
                                    value={customer.address || ""}
                                    onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                                    className="w-full border rounded p-2 dark:bg-gray-900"
                                    rows={2}
                                />
                            </div>
                            <div className="flex justify-end">
                                <button type="submit" className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm">
                                    <Save className="w-4 h-4 mr-2" /> Salvar Alterações
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Vehicles Card */}
                <div className="rounded-lg border bg-white shadow dark:bg-gray-800 dark:border-gray-700 h-fit">
                    <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <Car className="w-5 h-5 text-gray-500" />
                            Veículos
                        </h2>
                        <button
                            onClick={() => setShowVehicleForm(!showVehicleForm)}
                            className="text-sm text-indigo-600 hover:underline"
                        >
                            {showVehicleForm ? "Cancelar" : "+ Adicionar Veículo"}
                        </button>
                    </div>

                    <div className="p-6">
                        {showVehicleForm && (
                            <form onSubmit={handleCreateVehicle} className="mb-6 bg-gray-50 p-4 rounded border dark:bg-gray-750">
                                <h3 className="text-sm font-bold mb-3 text-gray-700">Novo Veículo</h3>
                                <div className="grid grid-cols-2 gap-3 mb-3">
                                    <div>
                                        <input
                                            placeholder="Placa"
                                            required
                                            className="w-full p-2 border rounded text-sm uppercase"
                                            value={newVehicle.plate}
                                            onChange={(e) => setNewVehicle({ ...newVehicle, plate: e.target.value.toUpperCase() })}
                                        />
                                    </div>
                                    <div>
                                        <input
                                            placeholder="Ano (Ex: 2020)"
                                            type="number"
                                            className="w-full p-2 border rounded text-sm"
                                            value={newVehicle.year}
                                            onChange={(e) => setNewVehicle({ ...newVehicle, year: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3 mb-3">
                                    <input
                                        placeholder="Marca (Ex: VW)"
                                        required
                                        className="w-full p-2 border rounded text-sm"
                                        value={newVehicle.brand}
                                        onChange={(e) => setNewVehicle({ ...newVehicle, brand: e.target.value })}
                                    />
                                    <input
                                        placeholder="Modelo (Ex: Gol)"
                                        required
                                        className="w-full p-2 border rounded text-sm"
                                        value={newVehicle.model}
                                        onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })}
                                    />
                                </div>
                                <div className="mb-3">
                                    <input
                                        placeholder="Cor"
                                        className="w-full p-2 border rounded text-sm"
                                        value={newVehicle.color}
                                        onChange={(e) => setNewVehicle({ ...newVehicle, color: e.target.value })}
                                    />
                                </div>
                                <button
                                    disabled={vehicleLoading}
                                    className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium"
                                >
                                    {vehicleLoading ? "Adicionando..." : "Salvar Veículo"}
                                </button>
                            </form>
                        )}

                        <div className="space-y-3">
                            {customer.vehicles.length === 0 ? (
                                <div className="text-center text-gray-500 py-4 text-sm">
                                    Nenhum veículo cadastrado.
                                </div>
                            ) : (
                                customer.vehicles.map(v => (
                                    <div key={v.id} className="flex items-center justify-between p-3 border rounded hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <div>
                                            <div className="font-bold text-gray-900 dark:text-gray-100">{v.brand} {v.model}</div>
                                            <div className="text-xs text-gray-500">{v.plate} • {v.color} • {v.year}</div>
                                        </div>
                                        <button
                                            onClick={async () => {
                                                if (confirm("Remover este veículo?")) {
                                                    await fetch(`/api/vehicles/${v.id}`, { method: 'DELETE' });
                                                    fetchCustomer();
                                                }
                                            }}
                                            className="text-xs text-red-500 hover:text-red-700 hover:underline"
                                        >
                                            Remover
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
