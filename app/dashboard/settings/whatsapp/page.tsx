"use client";

import { useState, useEffect } from "react";
import { MessageSquare, RefreshCw, CheckCircle2, AlertCircle, Send } from "lucide-react";

export default function WhatsAppSettingsPage() {
    const [status, setStatus] = useState<{ state: string; qr: string }>({ state: 'OFFLINE', qr: '' });
    const [loading, setLoading] = useState(true);
    const [targetPhone, setTargetPhone] = useState("");

    const fetchStatus = async () => {
        try {
            const res = await fetch("http://localhost:3001/status");
            const data = await res.json();
            setStatus(data);
            if (data.config?.targetPhone && !targetPhone) {
                setTargetPhone(data.config.targetPhone);
            }
        } catch (err) {
            setStatus({ state: 'OFFLINE', qr: '' });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            const res = await fetch("http://localhost:3001/config", {
                method: "POST",
                body: JSON.stringify({ targetPhone }),
            });
            if (res.ok) {
                alert("Configuração salva com sucesso!");
            }
        } catch (err) {
            alert("Erro ao salvar configuração.");
        }
    };

    useEffect(() => {
        fetchStatus();
        const interval = setInterval(fetchStatus, 5000); // Check every 5s
        return () => clearInterval(interval);
    }, []);

    const getStatusColor = () => {
        switch (status.state) {
            case 'CONNECTED': return 'text-green-500 bg-green-50';
            case 'WAITING_FOR_SCAN': return 'text-yellow-500 bg-yellow-50';
            case 'OFFLINE': return 'text-gray-500 bg-gray-50';
            default: return 'text-red-500 bg-red-50';
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Configurações WhatsApp</h1>
                    <p className="text-gray-500 mt-1">Gerencie a conexão do robô para relatórios automáticos.</p>
                </div>
                <div className={`px-4 py-2 rounded-full flex items-center gap-2 font-medium ${getStatusColor()}`}>
                    {status.state === 'CONNECTED' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    {status.state}
                </div>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
                {/* Connection Card */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border shadow-sm space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                            <MessageSquare size={24} />
                        </div>
                        <h2 className="text-xl font-bold">Conexão do Robô</h2>
                    </div>

                    {status.state === 'OFFLINE' ? (
                        <div className="p-8 text-center space-y-4">
                            <div className="mx-auto w-12 h-12 bg-red-50 text-red-500 flex items-center justify-center rounded-full">
                                <AlertCircle size={24} />
                            </div>
                            <p className="text-sm text-gray-600">
                                O serviço de WhatsApp não está rodando no servidor.
                                <br />
                                <code className="bg-gray-100 p-1 rounded text-xs">npm run whatsapp</code>
                            </p>
                        </div>
                    ) : status.state === 'CONNECTED' ? (
                        <div className="p-8 text-center space-y-4 bg-green-50/50 rounded-2xl border border-green-100">
                            <div className="mx-auto w-16 h-16 bg-green-100 text-green-600 flex items-center justify-center rounded-full">
                                <CheckCircle2 size={32} />
                            </div>
                            <h3 className="font-bold text-green-800">Conectado com Sucesso!</h3>
                            <p className="text-sm text-green-700">
                                Seu robô está pronto para enviar relatórios automáticos às 18:30.
                            </p>
                        </div>
                    ) : status.qr ? (
                        <div className="space-y-4 text-center">
                            <p className="text-sm font-medium text-gray-700">Escaneie o QR Code com seu WhatsApp:</p>
                            <div className="bg-white p-4 border rounded-2xl mx-auto inline-block">
                                <img src={status.qr} alt="QR Code" className="w-64 h-64" />
                            </div>
                            <p className="text-xs text-gray-400 italic">O QR Code expira em breve. Atualize se necessário.</p>
                        </div>
                    ) : (
                        <div className="p-8 text-center">
                            <RefreshCw className="mx-auto h-8 w-8 animate-spin text-indigo-600" />
                            <p className="mt-4 text-sm text-gray-500">Iniciando robô...</p>
                        </div>
                    )}
                </div>

                {/* Configuration Card */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border shadow-sm space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                            <Send size={24} />
                        </div>
                        <h2 className="text-xl font-bold">Configuração de Relatório</h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Número para Receber (com DDD)
                            </label>
                            <input
                                type="text"
                                value={targetPhone}
                                onChange={(e) => setTargetPhone(e.target.value)}
                                placeholder="Ex: 5551999999999"
                                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                            />
                            <p className="text-[10px] text-gray-400 mt-1">Deve incluir o código do país (55 para Brasil).</p>
                        </div>

                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                            <p className="text-xs text-blue-800 leading-relaxed">
                                <strong>Atenção:</strong> O relatório será enviado automaticamente todos os dias às <strong>20:00</strong> para o número acima. Certifique-se de que o robô esteja conectado.
                            </p>
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={!targetPhone || status.state !== 'CONNECTED'}
                            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-lg"
                        >
                            Salvar Configuração
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
