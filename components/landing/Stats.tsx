'use client';

import { motion } from 'framer-motion';

const stats = [
    { label: 'Anos de Experiência', value: '15+', color: 'text-indigo-600' },
    { label: 'Veículos Atendidos', value: '5k+', color: 'text-purple-600' },
    { label: 'Peças em Estoque', value: '10k+', color: 'text-blue-600' },
    { label: 'Satisfação Garantida', value: '100%', color: 'text-emerald-600' },
];

export default function Stats() {
    return (
        <section className="py-20 bg-indigo-50 dark:bg-neutral-900/50">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 text-center">
                    {stats.map((stat, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <h4 className={`text-4xl md:text-5xl font-black mb-2 ${stat.color}`}>
                                {stat.value}
                            </h4>
                            <p className="text-gray-600 dark:text-gray-400 font-medium text-sm md:text-base">
                                {stat.label}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
