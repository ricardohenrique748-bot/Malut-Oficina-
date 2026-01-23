"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, Car, Search, CheckCircle2, Calendar, FileText, UserCheck } from "lucide-react";

interface Customer {
    id: string;
    name: string;
    phone?: string;
}

interface Vehicle {
    id: string;
    plate: string;
    brand: string;
    model: string;
    color?: string;
}

export default function NewWorkOrderPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
    const [customerSearch, setCustomerSearch] = useState("");
    const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);

    const [notes, setNotes] = useState("");
    const [scheduledFor, setScheduledFor] = useState("");
    const [sellers, setSellers] = useState<any[]>([]);
    const [selectedSellerId, setSelectedSellerId] = useState<string>("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetch('/api/customers').then(res => res.json()).then(data => {
            setCustomers(data);
            setFilteredCustomers(data);
        });

        fetch('/api/staff').then(res => {
            if (res.ok) return res.json();
            return { users: [] };
        }).then(data => {
            if (data.users) {
                const availableSellers = data.users.filter((u: any) =>
                    ['ADMIN', 'VENDEDOR', 'RECEPCAO', 'GERENTE'].includes(u.role.name) && u.active
                );
                setSellers(availableSellers);
            }
        });
    }, []);

    useEffect(() => {
        const lower = customerSearch.toLowerCase();
        setFilteredCustomers(
            customers.filter(c => c.name.toLowerCase().includes(lower))
        );
    }, [customerSearch, customers]);

    const searchParams = useSearchParams();
    useEffect(() => {
        const preSelectedId = searchParams.get('customerId');
        if (preSelectedId && customers.length > 0 && !selectedCustomerId) {
            const customer = customers.find(c => c.id === preSelectedId);
            if (customer) {
                setSelectedCustomerId(customer.id);
                setStep(2);
            }
        }
    }, [searchParams, customers, selectedCustomerId]);

    useEffect(() => {
        if (selectedCustomerId) {
            fetch(`/api/customers/${selectedCustomerId}`).then(res => res.json()).then(data => {
                setVehicles(data.vehicles || []);
                if (data.vehicles && data.vehicles.length === 1) {
                    setSelectedVehicleId(data.vehicles[0].id);
                }
            });
        }
    }, [selectedCustomerId]);

    const handleSubmit = async () => {
        if (!selectedCustomerId || !selectedVehicleId) return;
        setLoading(true);

        try {
            const res = await fetch("/api/work-orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    customerId: selectedCustomerId,
                    vehicleId: selectedVehicleId,
                    notes,
                    scheduledFor: scheduledFor || null,
                    sellerId: selectedSellerId || null
                })
            });

            if (res.ok) {
                const os = await res.json();
                router.push(`/dashboard/work-orders/${os.id}`);
            } else {
                alert("Erro ao criar OS");
            }
        } catch (e) {
            alert("Erro ao criar OS");
        } finally {
            setLoading(false);
        }
    };

    const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
    const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId);

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/dashboard/work-orders"
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-xl transition-colors"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">
                        Nova Ordem de Serviço
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Preencha as informações para criar uma nova OS</p>
                </div>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-center gap-4">
                {[
                    { num: 1, label: "Cliente", icon: User },
                    { num: 2, label: "Veículo", icon: Car },
                    { num: 3, label: "Detalhes", icon: FileText }
                ].map(({ num, label, icon: Icon }) => (
                    <div key={num} className="flex items-center gap-4">
                        <div className="flex flex-col items-center">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${step >= num
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none'
                                    : 'bg-gray-100 dark:bg-gray-900 text-gray-400'
                                }`}>
                                {step > num ? <CheckCircle2 className="h-6 w-6" /> : <Icon className="h-6 w-6" />}
                            </div>
                            <span className={`text-xs font-bold mt-2 ${step >= num ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                                {label}
                            </span>
                        </div>
                        {num < 3 && (
                            <div className={`h-0.5 w-16 ${step > num ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-800'}`} />
                        )}
                    </div>
                ))}
            </div>

            {/* Step 1: Select Customer */}
            {step === 1 && (
                <div className="bg-white dark:bg-gray-950 rounded-3xl border border-gray-100 dark:border-gray-900 p-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl">
                            <User className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-gray-900 dark:text-white">Selecione o Cliente</h2>
                            <p className="text-sm text-gray-500">Escolha o cliente para esta ordem de serviço</p>
                        </div>
                    </div>

                    <div className="relative mb-6">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Pesquisar cliente por nome..."
                            value={customerSearch}
                            onChange={(e) => setCustomerSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
                        {filteredCustomers.map((customer) => (
                            <button
                                key={customer.id}
                                onClick={() => {
                                    setSelectedCustomerId(customer.id);
                                    setStep(2);
                                }}
                                className={`p-4 rounded-2xl border-2 text-left transition-all hover:border-indigo-200 dark:hover:border-indigo-900 ${selectedCustomerId === customer.id
                                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/20'
                                        : 'border-gray-100 dark:border-gray-900 bg-white dark:bg-gray-950'
                                    }`}
                            >
                                <div className="font-bold text-gray-900 dark:text-white">{customer.name}</div>
                                {customer.phone && (
                                    <div className="text-sm text-gray-500 mt-1">{customer.phone}</div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Step 2: Select Vehicle */}
            {step === 2 && (
                <div className="bg-white dark:bg-gray-950 rounded-3xl border border-gray-100 dark:border-gray-900 p-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl">
                            <Car className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-gray-900 dark:text-white">Selecione o Veículo</h2>
                            <p className="text-sm text-gray-500">Cliente: <strong>{selectedCustomer?.name}</strong></p>
                        </div>
                    </div>

                    {vehicles.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800">
                            <Car className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 font-medium">Nenhum veículo cadastrado para este cliente</p>
                            <Link
                                href={`/dashboard/customers/${selectedCustomerId}`}
                                className="inline-block mt-4 text-indigo-600 hover:text-indigo-700 font-bold text-sm"
                            >
                                Cadastrar veículo →
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-3">
                            {vehicles.map((vehicle) => (
                                <button
                                    key={vehicle.id}
                                    onClick={() => {
                                        setSelectedVehicleId(vehicle.id);
                                        setStep(3);
                                    }}
                                    className={`p-5 rounded-2xl border-2 text-left transition-all hover:border-indigo-200 dark:hover:border-indigo-900 ${selectedVehicleId === vehicle.id
                                            ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/20'
                                            : 'border-gray-100 dark:border-gray-900 bg-white dark:bg-gray-950'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="font-black text-lg text-gray-900 dark:text-white">
                                                {vehicle.brand} {vehicle.model}
                                            </div>
                                            <div className="flex items-center gap-3 mt-2 text-sm text-gray-600 dark:text-gray-400">
                                                <span className="font-mono font-bold">{vehicle.plate}</span>
                                                {vehicle.color && (
                                                    <>
                                                        <span>•</span>
                                                        <span>{vehicle.color}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <Car className="h-8 w-8 text-gray-300" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    <button
                        onClick={() => setStep(1)}
                        className="mt-6 text-sm text-gray-500 hover:text-gray-700 font-medium"
                    >
                        ← Voltar para seleção de cliente
                    </button>
                </div>
            )}

            {/* Step 3: Details */}
            {step === 3 && (
                <div className="space-y-6">
                    {/* Summary Card */}
                    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20 rounded-3xl border-2 border-indigo-100 dark:border-indigo-900/30 p-6">
                        <h3 className="text-sm font-black uppercase tracking-widest text-indigo-600 mb-4">Resumo da OS</h3>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <div className="text-xs text-gray-500 font-bold uppercase mb-1">Cliente</div>
                                <div className="font-bold text-gray-900 dark:text-white">{selectedCustomer?.name}</div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-500 font-bold uppercase mb-1">Veículo</div>
                                <div className="font-bold text-gray-900 dark:text-white">
                                    {selectedVehicle?.brand} {selectedVehicle?.model}
                                </div>
                                <div className="text-sm text-gray-600 font-mono">{selectedVehicle?.plate}</div>
                            </div>
                        </div>
                    </div>

                    {/* Details Form */}
                    <div className="bg-white dark:bg-gray-950 rounded-3xl border border-gray-100 dark:border-gray-900 p-8 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl">
                                <FileText className="h-6 w-6 text-indigo-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-gray-900 dark:text-white">Detalhes Iniciais</h2>
                                <p className="text-sm text-gray-500">Informações adicionais (opcional)</p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                <Calendar className="inline h-4 w-4 mr-2" />
                                Data Agendada (Opcional)
                            </label>
                            <input
                                type="datetime-local"
                                value={scheduledFor}
                                onChange={(e) => setScheduledFor(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                <UserCheck className="inline h-4 w-4 mr-2" />
                                Vendedor Responsável (Opcional)
                            </label>
                            <select
                                value={selectedSellerId}
                                onChange={(e) => setSelectedSellerId(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            >
                                <option value="">Nenhum</option>
                                {sellers.map(seller => (
                                    <option key={seller.id} value={seller.id}>
                                        {seller.name} ({seller.role.name})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                Observações / Problema Relatado
                            </label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={4}
                                placeholder="Descreva o problema ou serviço solicitado..."
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4">
                        <button
                            onClick={() => setStep(2)}
                            className="px-6 py-3 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-2xl font-bold hover:bg-gray-200 dark:hover:bg-gray-800 transition-all"
                        >
                            ← Voltar
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="flex-1 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-indigo-100 dark:shadow-none transition-all active:scale-95"
                        >
                            {loading ? "Abrindo OS..." : "Abrir OS →"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
