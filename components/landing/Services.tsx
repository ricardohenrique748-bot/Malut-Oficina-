'use client';

import { motion } from 'framer-motion';
import {
    Wrench,
    Zap,
    Activity,
    Shield,
    Car,
    Gauge,
    CircleDot
} from 'lucide-react';

const services = [
    {
        title: 'Mecânica Geral',
        desc: 'Reparos completos de motor, câmbio e sistemas de transmissão.',
        icon: Wrench,
        color: 'from-blue-500 to-indigo-600'
    },
    {
        title: 'Suspensão e Freios',
        desc: 'Segurança total para sua família com revisão de freios e amortecedores.',
        icon: Activity,
        color: 'from-emerald-400 to-teal-600'
    },
    {
        title: 'Prevenção e Óleo',
        desc: 'Trocas rápidas e eficientes para prolongar a vida útil do seu motor.',
        icon: Shield,
        color: 'from-rose-400 to-red-600'
    },
    {
        title: 'Revisão de Frota',
        desc: 'Soluções corporativas para manter sua empresa em movimento.',
        icon: Car,
        color: 'from-purple-400 to-indigo-600'
    },
    {
        title: 'Recapagem de Pneus',
        desc: 'Economia e sustentabilidade com recapagem profissional de alta qualidade.',
        icon: CircleDot,
        color: 'from-slate-400 to-gray-600'
    },
];

export default function Services() {
    return (
        <section id="serviços" className="py-24 bg-white dark:bg-neutral-900 border-t border-gray-100 dark:border-neutral-800">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl font-black text-gray-900 dark:text-white mb-4"
                    >
                        Soluções Completas
                    </motion.h2>
                    <div className="w-20 h-1.5 bg-indigo-600 mx-auto rounded-full mb-6"></div>
                    <p className="text-gray-500 max-w-2xl mx-auto text-lg italic">
                        "Da oficina para a estrada: tecnologia e experiência em cada parafuso."
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {services.map((service, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            whileHover={{ y: -5 }}
                            className="p-8 rounded-3xl bg-gray-50 dark:bg-neutral-800/50 border border-gray-100 dark:border-neutral-700 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all text-left"
                        >
                            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center text-white shadow-lg mb-6`}>
                                <service.icon size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{service.title}</h3>
                            <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                                {service.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
