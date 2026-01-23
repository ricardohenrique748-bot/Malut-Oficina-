'use client';

import { X } from 'lucide-react';
import { useEffect } from 'react';

interface AboutModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AboutModal({ isOpen, onClose }: AboutModalProps) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-white dark:bg-gray-900 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-8 rounded-t-3xl">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold mb-2">Sobre Nós</h2>
                            <p className="text-lg opacity-90">"Atenção que vira solução"</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 space-y-6">
                    <div className="prose dark:prose-invert max-w-none">
                        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                            A Malut é um grupo formado pelas empresas <strong>Malut Ferragens</strong>, <strong>Malut Pneus</strong> e <strong>Malut Oficina</strong>,
                            atuando de forma integrada para oferecer soluções completas em peças, pneus e manutenção automotiva e pesada.
                        </p>

                        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                            Com foco em <strong>qualidade, confiança e atendimento técnico especializado</strong>, a Malut atende desde clientes
                            do dia a dia até operações mais exigentes, como frotas, empresas, fazendas e serviços fora de estrada.
                            Trabalhamos com produtos selecionados, marcas reconhecidas no mercado e uma equipe capacitada para
                            garantir segurança, desempenho e economia aos nossos clientes.
                        </p>

                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 rounded-2xl p-6 my-6">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Nossa Missão</h3>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                Guiados pelo nosso slogan <strong>"Atenção que vira solução"</strong>, acreditamos que ouvir, entender e cuidar de cada detalhe faz toda a diferença.
                                Nosso compromisso é transformar a necessidade do cliente em uma solução eficiente, com transparência, responsabilidade e parceria de longo prazo.
                            </p>
                        </div>

                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">Nossas Empresas</h3>

                        <div className="space-y-4">
                            <div className="border-l-4 border-blue-500 pl-4">
                                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Malut Ferragens</h4>
                                <p className="text-gray-700 dark:text-gray-300">
                                    Oferece uma linha completa de peças, ferramentas e acessórios.
                                </p>
                            </div>

                            <div className="border-l-4 border-indigo-500 pl-4">
                                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Malut Pneus</h4>
                                <p className="text-gray-700 dark:text-gray-300">
                                    É especializada em pneus, recapagem e soluções para veículos leves, utilitários e pesados.
                                </p>
                            </div>

                            <div className="border-l-4 border-purple-500 pl-4">
                                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Malut Oficina</h4>
                                <p className="text-gray-700 dark:text-gray-300">
                                    Realiza serviços de manutenção preventiva e corretiva, com foco em agilidade, confiabilidade e qualidade técnica.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
