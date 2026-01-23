
"use client";

import { useState, useEffect } from "react";
import { Settings, ExternalLink, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { useSearchParams } from "next/navigation";

export default function IntegrationsSettings() {
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);
    const success = searchParams.get("success");
    const error = searchParams.get("error");

    const handleConnectBling = async () => {
        setLoading(true);
        try {
            // We'll call a server action or API to get the auth URL
            const res = await fetch("/api/integrations/bling/auth-url");
            const { url } = await res.json();
            window.location.href = url;
        } catch (e) {
            alert("Erro ao iniciar conexão com Bling");
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <Settings className="h-8 w-8 text-gray-700" />
                    Configurações de Integração
                </h1>
                <p className="text-gray-500">Gerencie as conexões com sistemas externos.</p>
            </div>

            {success === "bling_connected" && (
                <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5" />
                    Bling conectado com sucesso! Agora você pode sincronizar estoque e emitir notas.
                </div>
            )}

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Erro na conexão: {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Bling Card */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <img src="https://www.bling.com.br/favicon.ico" alt="Bling" className="w-8 h-8" />
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded">ERP</span>
                        </div>
                        <h3 className="text-lg font-bold mb-2">Bling ERP</h3>
                        <p className="text-sm text-gray-500 mb-6">
                            Sincronize seu estoque de peças e emita Notas Fiscais (NF-e/NFC-e) automaticamente a partir das suas Ordens de Serviço.
                        </p>
                    </div>

                    <button
                        onClick={handleConnectBling}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
                    >
                        {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
                        {loading ? "Conectando..." : "Conectar ao Bling"}
                    </button>
                </div>

                {/* Placeholder for future integrations */}
                <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-xl border border-dashed flex flex-col items-center justify-center text-center opacity-60">
                    <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mb-4">
                        <Settings className="h-5 w-5 text-gray-400" />
                    </div>
                    <h3 className="text-gray-400 font-medium">Em breve</h3>
                    <p className="text-xs text-gray-400">Novas integrações em desenvolvimento.</p>
                </div>
            </div>
        </div>
    );
}
