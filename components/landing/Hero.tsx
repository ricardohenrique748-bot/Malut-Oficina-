'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Settings, ShieldCheck, Clock, Calendar } from 'lucide-react';
import ScheduleForm from './ScheduleForm';

export default function Hero() {
    const [isScheduleOpen, setIsScheduleOpen] = useState(false);

    return (
        <>
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
                {/* Background with modern overlay */}
                <div
                    className="absolute inset-0 z-0 bg-cover bg-center"
                    style={{ backgroundImage: "url('/background.jpg')" }}
                >
                    <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
                </div>

                {/* Animated geometric shapes for premium feel */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <motion.div
                        animate={{
                            rotate: [0, 360],
                            scale: [1, 1.2, 1],
                        }}
                        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                        className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full"
                    />
                    <motion.div
                        animate={{
                            rotate: [360, 0],
                            scale: [1, 1.3, 1],
                        }}
                        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                        className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-purple-600/10 blur-[120px] rounded-full"
                    />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-indigo-300 text-sm font-semibold mb-6">
                            A Oficina que cuida do seu carro como se fosse nosso
                        </span>
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-8 tracking-tight">
                            Mecânica de <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">Precisão</span> e Confiança.
                        </h1>
                        <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-300 mb-12 leading-relaxed">
                            Diagnósticos avançados, equipe certificada e a transparência que você merece. O cuidado que seu veículo precisa está na Malut.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button
                                onClick={() => setIsScheduleOpen(true)}
                                className="group relative px-8 py-4 bg-white text-indigo-900 font-bold rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-xl hover:shadow-white/20 flex items-center gap-2"
                            >
                                <Calendar size={20} />
                                Agendar Manutenção
                                <ChevronRight className="group-hover:translate-x-1 transition-transform" size={20} />
                            </button>
                            <a
                                href="https://wa.me/5511999999999?text=Olá!%20Gostaria%20de%20mais%20informações."
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold rounded-2xl transition-all hover:bg-white/20 hover:scale-105 active:scale-95"
                            >
                                Falar no WhatsApp
                            </a>
                        </div>
                    </motion.div>

                    {/* Feature quick badges */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8, duration: 1 }}
                        className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-white/10 pt-10"
                    >
                        <div className="flex items-center gap-4 justify-center md:justify-start">
                            <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                                <Settings className="text-indigo-400" size={24} />
                            </div>
                            <div className="text-left">
                                <h3 className="text-white font-bold">Tecnologia de Ponta</h3>
                                <p className="text-gray-400 text-sm">Scaners originais e ferramentas precisas.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 justify-center md:justify-start">
                            <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                                <ShieldCheck className="text-purple-400" size={24} />
                            </div>
                            <div className="text-left">
                                <h3 className="text-white font-bold">Peças Genuínas</h3>
                                <p className="text-gray-400 text-sm">Garantia total em todas as substituições.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 justify-center md:justify-start">
                            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                                <Clock className="text-blue-400" size={24} />
                            </div>
                            <div className="text-left">
                                <h3 className="text-white font-bold">Agilidade no Prazo</h3>
                                <p className="text-gray-400 text-sm">Seu carro de volta no tempo combinado.</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            <ScheduleForm isOpen={isScheduleOpen} onClose={() => setIsScheduleOpen(false)} />
        </>
    );
}
