"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { submitLead } from "@/app/dashboard/crm/actions";

const questions = [
    { id: 'faturamento', text: 'Qual é o faturamento atual da sua empresa?', subtext: 'Selecione a faixa aproximada', type: 'select', options: ['0-10k', '10-50k', '50-200k', '200k+'] },
    { id: 'investimento', text: 'Quanto pretende investir em tráfego pago?', subtext: 'Investimento mensal desejado', type: 'select', options: ['Até R$ 1.000', 'R$ 1.000 - R$ 3.000', 'R$ 3.000 - R$ 5.000', 'R$ 10.000+'] },
    { id: 'instagram', text: 'Qual o Instagram da sua empresa?', subtext: '@usuario', type: 'input', placeholder: '@empresa' },
    { id: 'ramo', text: 'Qual é o ramo da sua empresa?', subtext: 'Ex: E-commerce, Saúde, Educação...', type: 'input', placeholder: 'Sua área de atuação' },
    { id: 'faz_trafego', text: 'Você já faz tráfego pago atualmente?', subtext: 'Facebook, Google, etc.', type: 'select', options: ['Sim, já invisto', 'Não, comecei agora', 'Já fiz, mas parei'] },
    { id: 'objetivo', text: 'Qual seu objetivo principal?', subtext: 'O que você espera alcançar?', type: 'input', placeholder: 'Vendas, Leads, Reconhecimento...' },
    { id: 'nome', text: 'Qual seu nome?', subtext: 'Como podemos te chamar?', type: 'input', placeholder: 'Seu nome completo' },
    { id: 'email', text: 'Seu melhor e-mail?', subtext: 'Para enviarmos a proposta', type: 'email', placeholder: 'nome@exemplo.com' },
    { id: 'telefone', text: 'Telefone com DDD?', subtext: 'WhatsApp para contato rápido', type: 'tel', placeholder: '(00) 00000-0000' }
];

export default function QuizPage() {
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState<any>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const progress = (currentStep / questions.length) * 100;
    const question = questions[currentStep];

    const handleNext = () => {
        if (currentStep < questions.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            setCurrentStep(questions.length); // Final screen
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) setCurrentStep(currentStep - 1);
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        const res = await submitLead(answers);
        setIsSubmitting(false);
        if (res.success) setSubmitted(true);
        else alert("Erro ao enviar. Tente novamente.");
    };

    return (
        <div className="min-h-screen bg-[#0b1726] text-white flex items-center justify-center p-6 relative overflow-hidden selection:bg-blue-500/30">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-20 pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #1e3a8a 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>

            {/* Progress Bar */}
            <div className="fixed top-0 left-0 w-full h-1 bg-white/5 z-50">
                <motion.div
                    className="h-full bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)]"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                />
            </div>

            <div className="w-full max-w-xl relative">
                <AnimatePresence mode="wait">
                    {currentStep < questions.length ? (
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                            className="space-y-12"
                        >
                            <div className="space-y-4">
                                <span className="text-blue-500 font-bold text-xs uppercase tracking-[0.3em]">Pergunta {currentStep + 1} de {questions.length}</span>
                                <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">{question.text}</h2>
                                <p className="text-gray-400 text-lg font-medium">{question.subtext}</p>
                            </div>

                            <div className="space-y-4">
                                {question.type === 'select' ? (
                                    <div className="grid gap-3">
                                        {question.options?.map((option) => (
                                            <button
                                                key={option}
                                                onClick={() => {
                                                    setAnswers({ ...answers, [question.id]: option });
                                                    setTimeout(handleNext, 300);
                                                }}
                                                className={`w-full text-left p-6 rounded-2xl border-2 transition-all font-semibold text-xl flex justify-between items-center group
                          ${answers[question.id] === option
                                                        ? 'border-blue-500 bg-blue-500/10'
                                                        : 'border-white/5 bg-white/5 hover:bg-white/10 hover:border-blue-500/30'}`}
                                            >
                                                <span>{option}</span>
                                                <span className={`transition-all duration-300 ${answers[question.id] === option ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'}`}>→</span>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <input
                                        type={question.type}
                                        value={answers[question.id] || ''}
                                        onChange={(e) => setAnswers({ ...answers, [question.id]: e.target.value })}
                                        onKeyDown={(e) => e.key === 'Enter' && answers[question.id] && handleNext()}
                                        autoFocus
                                        placeholder={question.placeholder}
                                        className="w-full bg-transparent border-b-4 border-white/10 focus:border-blue-500 py-6 text-2xl md:text-4xl font-extrabold outline-none transition-all placeholder:text-white/5"
                                    />
                                )}
                            </div>

                            <div className="flex items-center gap-6 pt-12">
                                {currentStep > 0 && (
                                    <button onClick={handlePrev} className="text-gray-500 hover:text-white font-bold text-xs uppercase tracking-widest transition-colors">Voltar</button>
                                )}
                                {question.type !== 'select' && (
                                    <button
                                        disabled={!answers[question.id]}
                                        onClick={handleNext}
                                        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-30 text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-blue-600/30 transition-all active:scale-95"
                                    >
                                        Próximo
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center space-y-8"
                        >
                            {!submitted ? (
                                <>
                                    <div className="h-24 w-24 bg-blue-600 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl shadow-blue-600/40 animate-pulse">
                                        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                    </div>
                                    <div className="space-y-4">
                                        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">Tudo pronto!</h2>
                                        <p className="text-gray-400 text-lg">Suas respostas foram salvas. Clique abaixo para realizar a análise inteligente.</p>
                                    </div>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={isSubmitting}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white p-7 rounded-3xl font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-blue-600/40 transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50"
                                    >
                                        {isSubmitting ? 'Analisando...' : 'Enviar e Gerar Lead'}
                                    </button>
                                </>
                            ) : (
                                <div className="space-y-6">
                                    <h2 className="text-5xl font-extrabold tracking-tight text-blue-500">Sucesso!</h2>
                                    <p className="text-gray-400 text-xl font-medium leading-relaxed">Sua qualificação foi processada pela nossa IA. <br /> Nossa equipe entrará em contato em breve.</p>
                                    <div className="pt-12">
                                        <button onClick={() => window.location.href = '/'} className="text-xs font-black uppercase tracking-widest text-gray-600 hover:text-white transition-colors">Voltar ao Início</button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
