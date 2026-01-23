'use client';

import { Building2, Wrench, Truck } from 'lucide-react';

export default function About() {
    return (
        <section id="sobre" className="py-24 bg-gradient-to-b from-white to-gray-50 dark:from-black dark:to-gray-900">
            <div className="max-w-7xl mx-auto px-6">
                {/* Header */}
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        Nossas Empresas
                    </h2>
                    <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
                        Soluções completas em peças, pneus e manutenção automotiva e pesada
                    </p>
                </div>

                {/* Business Units */}
                <div className="grid md:grid-cols-3 gap-8 mb-12">
                    {/* Malut Ferragens */}
                    <div className="group bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Building2 className="text-white" size={32} />
                        </div>
                        <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                            Malut Ferragens
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                            Oferece uma linha completa de peças, ferramentas e acessórios para atender todas as necessidades automotivas.
                        </p>
                    </div>

                    {/* Malut Pneus */}
                    <div className="group bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Truck className="text-white" size={32} />
                        </div>
                        <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                            Malut Pneus
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                            Especializada em pneus, recapagem e soluções para veículos leves, utilitários e pesados.
                        </p>
                    </div>

                    {/* Malut Oficina */}
                    <div className="group bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Wrench className="text-white" size={32} />
                        </div>
                        <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                            Malut Oficina
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                            Realiza serviços de manutenção preventiva e corretiva, com foco em agilidade, confiabilidade e qualidade técnica.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
