"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";

export default function NewFinancialRecordPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        description: "",
        type: "EXPENSE",
        amount: "",
        status: "PAID",
        paymentMethod: "CASH",
        category: "OUTROS"
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/financial", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                router.push("/dashboard/financial");
                router.refresh(); // Refresh page data
            } else {
                alert("Erro ao salvar lançamento");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/financial" className="p-2 hover:bg-gray-100 rounded-full dark:hover:bg-gray-800">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <h1 className="text-2xl font-bold">Novo Lançamento</h1>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border dark:border-gray-700">
                <form onSubmit={handleSubmit} className="space-y-4">

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Tipo</label>
                            <select
                                className="w-full border rounded p-2"
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            >
                                <option value="EXPENSE">Despesa (Saída)</option>
                                <option value="INCOME">Receita (Entrada)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Status</label>
                            <select
                                className="w-full border rounded p-2"
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            >
                                <option value="PAID">Pago / Recebido</option>
                                <option value="PENDING">Pendente</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Meio de Pagamento</label>
                            <select
                                className="w-full border rounded p-2"
                                value={formData.paymentMethod}
                                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                            >
                                <option value="CASH">Dinheiro</option>
                                <option value="PIX">Pix</option>
                                <option value="CARD">Cartão (Débito/Crédito)</option>
                                <option value="TRANSFER">Transferência</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Categoria</label>
                            <select
                                className="w-full border rounded p-2"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            >
                                <option value="OUTROS">Outros</option>
                                <option value="LUZ">Energia/Luz</option>
                                <option value="ALUGUEL">Aluguel</option>
                                <option value="FORNECEDOR">Fornecedor</option>
                                <option value="PRO-LABORE">Pró-labore</option>
                                <option value="SALARES">Salários/Equipe</option>
                                <option value="IMPOSTO">Impostos</option>
                                <option value="SERVICE_REVENUE">Receita de Serviços</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Descrição</label>
                        <input
                            required
                            className="w-full border rounded p-2"
                            placeholder="Ex: Conta de Luz, Venda de Peça Avulsa..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Valor (R$)</label>
                        <input
                            required
                            type="number"
                            step="0.01"
                            className="w-full border rounded p-2 text-lg font-bold"
                            placeholder="0.00"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 text-white font-bold rounded shadow transition ${formData.type === 'INCOME' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                    >
                        {loading ? "Salvando..." : `Confirmar ${formData.type === 'INCOME' ? 'Receita' : 'Despesa'}`}
                    </button>

                </form>
            </div>
        </div>
    );
}
