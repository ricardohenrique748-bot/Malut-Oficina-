"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, User, FileText, Phone, Mail, MapPin, Car, CheckCircle2 } from "lucide-react";

export default function NewCustomerPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        document: "",
        phone: "",
        email: "",
        address: ""
    });
    const [showVehicle, setShowVehicle] = useState(false);
    const [vehicleData, setVehicleData] = useState({
        plate: "", brand: "", model: "", color: "", year: ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/customers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    vehicle: showVehicle ? vehicleData : undefined
                }),
            });

            if (res.ok) {
                router.push("/dashboard/customers");
                router.refresh();
            } else {
                alert("Erro ao criar cliente");
            }
        } catch (err) {
            console.error(err);
            alert("Erro ao criar cliente");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/dashboard/customers"
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-xl transition-colors"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">
                        Novo Cliente
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Preencha os dados do cliente e opcionalmente adicione um veículo</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Customer Information */}
                <div className="bg-white dark:bg-gray-950 rounded-3xl border border-gray-100 dark:border-gray-900 p-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl">
                            <User className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-gray-900 dark:text-white">Dados do Cliente</h2>
                            <p className="text-sm text-gray-500">Informações pessoais e de contato</p>
                        </div>
                    </div>

                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                <User className="inline h-4 w-4 mr-2" />
                                Nome Completo *
                            </label>
                            <input
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
                                placeholder="Ex: João Silva Santos"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                    <FileText className="inline h-4 w-4 mr-2" />
                                    CPF/CNPJ
                                </label>
                                <input
                                    name="document"
                                    value={formData.document}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    placeholder="000.000.000-00"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                    <Phone className="inline h-4 w-4 mr-2" />
                                    Telefone
                                </label>
                                <input
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    placeholder="(11) 99999-9999"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                <Mail className="inline h-4 w-4 mr-2" />
                                Email
                            </label>
                            <input
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                placeholder="cliente@email.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                <MapPin className="inline h-4 w-4 mr-2" />
                                Endereço Completo
                            </label>
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                                placeholder="Rua Exemplo, 123 - Bairro - Cidade/UF"
                                rows={3}
                            />
                        </div>
                    </div>
                </div>

                {/* Vehicle Section */}
                <div className="bg-white dark:bg-gray-950 rounded-3xl border border-gray-100 dark:border-gray-900 p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
                                <Car className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-gray-900 dark:text-white">Veículo Principal</h2>
                                <p className="text-sm text-gray-500">Adicione o veículo principal do cliente (opcional)</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={showVehicle}
                                onChange={(e) => setShowVehicle(e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                        </label>
                    </div>

                    {showVehicle && (
                        <div className="space-y-5 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-6 rounded-2xl border-2 border-blue-100 dark:border-blue-900/30">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                        Placa *
                                    </label>
                                    <input
                                        value={vehicleData.plate}
                                        onChange={(e) => setVehicleData({ ...vehicleData, plate: e.target.value.toUpperCase() })}
                                        className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all uppercase font-mono font-bold"
                                        placeholder="ABC-1234"
                                        required={showVehicle}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                        Ano
                                    </label>
                                    <input
                                        type="number"
                                        value={vehicleData.year}
                                        onChange={(e) => setVehicleData({ ...vehicleData, year: e.target.value })}
                                        className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="2024"
                                        min="1900"
                                        max="2030"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                        Marca *
                                    </label>
                                    <input
                                        value={vehicleData.brand}
                                        onChange={(e) => setVehicleData({ ...vehicleData, brand: e.target.value })}
                                        className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="Ex: Fiat, VW, Chevrolet"
                                        required={showVehicle}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                        Modelo *
                                    </label>
                                    <input
                                        value={vehicleData.model}
                                        onChange={(e) => setVehicleData({ ...vehicleData, model: e.target.value })}
                                        className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="Ex: Uno, Gol, Onix"
                                        required={showVehicle}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                    Cor
                                </label>
                                <input
                                    value={vehicleData.color}
                                    onChange={(e) => setVehicleData({ ...vehicleData, color: e.target.value })}
                                    className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    placeholder="Ex: Branco, Preto, Prata"
                                />
                            </div>
                        </div>
                    )}

                    {!showVehicle && (
                        <div className="text-center py-8 bg-gray-50 dark:bg-gray-900 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800">
                            <Car className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 font-medium text-sm">Ative o switch acima para adicionar um veículo</p>
                            <p className="text-gray-400 text-xs mt-1">Você também pode adicionar veículos depois</p>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                    <Link
                        href="/dashboard/customers"
                        className="px-6 py-3 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-2xl font-bold hover:bg-gray-200 dark:hover:bg-gray-800 transition-all"
                    >
                        Cancelar
                    </Link>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-indigo-100 dark:shadow-none transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>Salvando...</>
                        ) : (
                            <>
                                <Save className="h-5 w-5" />
                                Salvar Cliente
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
