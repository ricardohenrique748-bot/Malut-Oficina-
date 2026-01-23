"use client";

import { useState } from "react";
import { Calendar, Car, User, Phone, Mail, X, CheckCircle2, Loader2 } from "lucide-react";

interface ScheduleFormProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ScheduleForm({ isOpen, onClose }: ScheduleFormProps) {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        vehicleBrand: "",
        vehicleModel: "",
        vehiclePlate: "",
        service: "",
        preferredDate: "",
        notes: ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/leads", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setSuccess(true);
                setTimeout(() => {
                    onClose();
                    setSuccess(false);
                    setFormData({
                        name: "",
                        phone: "",
                        email: "",
                        vehicleBrand: "",
                        vehicleModel: "",
                        vehiclePlate: "",
                        service: "",
                        preferredDate: "",
                        notes: ""
                    });
                }, 2000);
            } else {
                alert("Erro ao enviar solicitação. Tente novamente.");
            }
        } catch (error) {
            alert("Erro ao enviar solicitação. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-950 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                {success ? (
                    <div className="p-12 text-center">
                        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="h-10 w-10 text-green-600" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
                            Agendamento Recebido!
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            Entraremos em contato em breve para confirmar seu horário.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="sticky top-0 bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-900 p-6 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                                    Agendar Manutenção
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    Preencha os dados e entraremos em contato
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-xl transition-colors"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* Personal Info */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-black uppercase tracking-widest text-gray-500">
                                    Seus Dados
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                            placeholder="João Silva"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                            <Phone className="inline h-4 w-4 mr-2" />
                                            Telefone *
                                        </label>
                                        <input
                                            name="phone"
                                            required
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
                                        placeholder="seuemail@exemplo.com"
                                    />
                                </div>
                            </div>

                            {/* Vehicle Info */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-black uppercase tracking-widest text-gray-500">
                                    Dados do Veículo
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                            <Car className="inline h-4 w-4 mr-2" />
                                            Marca
                                        </label>
                                        <input
                                            name="vehicleBrand"
                                            value={formData.vehicleBrand}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                            placeholder="Ex: Fiat, VW, Chevrolet"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                            Modelo
                                        </label>
                                        <input
                                            name="vehicleModel"
                                            value={formData.vehicleModel}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                            placeholder="Ex: Uno, Gol, Onix"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                        Placa (Opcional)
                                    </label>
                                    <input
                                        name="vehiclePlate"
                                        value={formData.vehiclePlate}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all uppercase font-mono"
                                        placeholder="ABC-1234"
                                    />
                                </div>
                            </div>

                            {/* Service Info */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-black uppercase tracking-widest text-gray-500">
                                    Serviço Desejado
                                </h3>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                        Tipo de Serviço *
                                    </label>
                                    <select
                                        name="service"
                                        required
                                        value={formData.service}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    >
                                        <option value="">Selecione o serviço</option>
                                        <option value="Revisão Preventiva">Revisão Preventiva</option>
                                        <option value="Troca de Óleo">Troca de Óleo</option>
                                        <option value="Alinhamento e Balanceamento">Alinhamento e Balanceamento</option>
                                        <option value="Freios">Freios</option>
                                        <option value="Suspensão">Suspensão</option>
                                        <option value="Ar Condicionado">Ar Condicionado</option>
                                        <option value="Diagnóstico">Diagnóstico</option>
                                        <option value="Outro">Outro</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                        <Calendar className="inline h-4 w-4 mr-2" />
                                        Data Preferencial
                                    </label>
                                    <input
                                        name="preferredDate"
                                        type="date"
                                        value={formData.preferredDate}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                        Observações
                                    </label>
                                    <textarea
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleChange}
                                        rows={3}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                                        placeholder="Descreva o problema ou serviço necessário..."
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-indigo-100 dark:shadow-none transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        Enviando...
                                    </>
                                ) : (
                                    <>
                                        <Calendar className="h-5 w-5" />
                                        Solicitar Agendamento
                                    </>
                                )}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
