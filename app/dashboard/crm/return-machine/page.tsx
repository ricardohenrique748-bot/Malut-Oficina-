"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { MessageSquare, Phone, Calendar, Car, Loader2, ArrowLeft, Send } from "lucide-react";
import Link from "next/link";

export default function ReturnMachinePage() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [sendingId, setSendingId] = useState<string | null>(null);

    const fetchReturnList = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/crm/return-machine');
            if (res.ok) {
                const json = await res.json();
                setData(json);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async (client: any) => {
        if (!confirm(`Deseja enviar mensagem de retorno para ${client.name}?`)) return;

        setSendingId(client.id);
        try {
            const message = `Olá ${client.name}! 👋\n\nNotamos que faz mais de 6 meses desde o último serviço do seu ${client.vehicle} aqui na Malut Oficina. 🚗\n\nA manutenção preventiva é a melhor forma de garantir sua segurança e economizar. Que tal agendarmos uma revisão para esta semana? 😁`;

            const res = await fetch('http://localhost:3001/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: client.phone, message })
            });

            if (res.ok) {
                alert("Mensagem enviada com sucesso!");
            } else {
                alert("Erro ao enviar mensagem. Verifique a conexão do robô WhatsApp.");
            }
        } catch (e) {
            alert("Erro ao conectar com o serviço de WhatsApp.");
        } finally {
            setSendingId(null);
        }
    };

    useEffect(() => {
        fetchReturnList();
    }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-screen">
            <Loader2 className="h-10 w-10 text-indigo-500 animate-spin mb-4" />
            <p className="text-gray-400 font-medium">Buscando Clientes Sumidos...</p>
        </div>
    );

    return (
        <div className="space-y-8 max-w-6xl mx-auto pb-20 px-4 md:px-0">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/crm" className="p-2 hover:bg-gray-100 rounded-full dark:hover:bg-gray-800 transition-colors">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="text-3xl font-black tracking-tight">Máquina de Retorno</h1>
                    <p className="text-gray-500 text-sm">Clientes que não realizam serviços há mais de 6 meses.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.map((client) => (
                    <div key={client.id} className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all group">
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-12 h-12 bg-gray-50 dark:bg-gray-900 rounded-2xl flex items-center justify-center">
                                <Phone className="h-6 w-6 text-gray-400" />
                            </div>
                            <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                                {client.daysSinceLastService ? `${client.daysSinceLastService} dias sumido` : "Nunca veio"}
                            </span>
                        </div>

                        <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">{client.name}</h3>

                        <div className="space-y-3 mb-8">
                            <div className="flex items-center gap-3 text-sm text-gray-500">
                                <Car className="h-4 w-4" />
                                <span className="font-medium">{client.vehicle}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-500">
                                <Calendar className="h-4 w-4" />
                                <span className="font-medium">
                                    Último serviço: {client.lastServiceDate ? format(new Date(client.lastServiceDate), "dd/MM/yyyy") : "Nenhum registro"}
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={() => handleSendMessage(client)}
                            disabled={sendingId === client.id}
                            className="w-full py-4 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-black uppercase text-xs rounded-xl shadow-lg shadow-green-100 dark:shadow-none transition flex items-center justify-center gap-2"
                        >
                            {sendingId === client.id ? <Loader2 className="animate-spin h-4 w-4" /> : <Send className="h-4 w-4" />}
                            Enviar Convite Retorno
                        </button>
                    </div>
                ))}

                {data.length === 0 && (
                    <div className="col-span-full py-20 bg-gray-50 dark:bg-gray-900 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center">
                        <MessageSquare className="h-12 w-12 text-gray-300 mb-4" />
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Todos os seus clientes estão em dia!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
