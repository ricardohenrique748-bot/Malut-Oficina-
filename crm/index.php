<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Qualificação de Lead | Malut CRM</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
        [x-cloak] { display: none !important; }
        .bg-pattern {
            background-color: #0b1726;
            background-image: radial-gradient(circle at 2px 2px, #1e3a8a 1px, transparent 0);
            background-size: 40px 40px;
        }
        .step-transition {
            transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
    </style>
</head>
<body class="bg-pattern text-white min-h-screen flex items-center justify-center p-4 overflow-hidden" x-data="quiz()">
    
    <!-- Progress Bar -->
    <div class="fixed top-0 left-0 w-full h-1 bg-white/5 z-50">
        <div class="h-full bg-blue-500 step-transition" :style="`width: ${progress}%` shadow-lg shadow-blue-500/50"></div>
    </div>

    <!-- Main Container -->
    <div class="w-full max-w-xl">
        
        <!-- Step Wrapper -->
        <div class="relative min-h-[400px]">
            
            <form @submit.prevent="submitQuiz">
                
                <!-- Steps -->
                <template x-for="(question, index) in questions" :key="index">
                    <div 
                        x-show="currentStep === index"
                        x-transition:enter="step-transition delay-150 opacity-0 translate-y-8"
                        x-transition:enter-end="opacity-100 translate-y-0"
                        x-transition:leave="step-transition opacity-100 translate-y-0"
                        x-transition:leave-end="opacity-0 -translate-y-8"
                        class="absolute inset-0 flex flex-col justify-center space-y-8"
                    >
                        <!-- Question Info -->
                        <div class="space-y-2">
                            <span class="text-blue-500 font-bold text-xs uppercase tracking-[0.3em]" x-text="`Pergunta ${index + 1}`"></span>
                            <h2 class="text-3xl md:text-4xl font-extrabold tracking-tight" x-text="question.text"></h2>
                            <p class="text-gray-400 text-sm" x-text="question.subtext"></p>
                        </div>

                        <!-- Answer Input -->
                        <div class="space-y-4">
                            <!-- Select Type -->
                            <template x-if="question.type === 'select'">
                                <div class="grid gap-3">
                                    <template x-for="option in question.options" :key="option">
                                        <button 
                                            type="button"
                                            @click="answers[question.id] = option; nextStep()"
                                            class="w-full text-left p-5 rounded-2xl border-2 border-white/5 bg-white/5 hover:bg-white/10 hover:border-blue-500/50 transition-all font-medium text-lg flex justify-between items-center group"
                                            :class="answers[question.id] === option ? 'border-blue-500 bg-blue-500/10' : ''"
                                        >
                                            <span x-text="option"></span>
                                            <span class="opacity-0 group-hover:opacity-100 text-blue-500 transition-opacity">→</span>
                                        </button>
                                    </template>
                                </div>
                            </template>

                            <!-- Input Type -->
                            <template x-if="question.type === 'input' || question.type === 'email' || question.type === 'tel'">
                                <input 
                                    :type="question.type"
                                    x-model="answers[question.id]"
                                    @keydown.enter.prevent="nextStep()"
                                    class="w-full bg-transparent border-b-4 border-white/10 focus:border-blue-500 py-4 text-2xl md:text-3xl font-bold outline-none transition-all placeholder:text-white/10"
                                    :placeholder="question.placeholder"
                                    autofocus
                                />
                            </template>
                        </div>

                        <!-- Buttons -->
                        <div class="flex items-center gap-4 pt-8">
                            <template x-if="currentStep > 0">
                                <button type="button" @click="prevStep()" class="text-gray-500 hover:text-white font-bold text-xs uppercase tracking-widest transition-colors">Voltar</button>
                            </template>
                            <template x-if="question.type !== 'select'">
                                <button 
                                    type="button" 
                                    @click="nextStep()" 
                                    class="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-600/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                    :disabled="!answers[question.id]"
                                >
                                    Próximo
                                </button>
                            </template>
                        </div>
                    </div>
                </template>

                <!-- Final Screen -->
                <div 
                    x-show="currentStep === questions.length"
                    class="absolute inset-0 flex flex-col items-center justify-center text-center space-y-6"
                    x-cloak
                >
                    <template x-if="!submitted">
                        <div class="space-y-6 animate-in fade-in zoom-in duration-500">
                            <div class="h-20 w-20 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-blue-600/40">
                                <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                            </div>
                            <h2 class="text-4xl font-extrabold tracking-tight">Tudo pronto!</h2>
                            <p class="text-gray-400">Analise concluída. Clique abaixo para enviar seus dados à nossa equipe.</p>
                            <button 
                                type="submit" 
                                class="w-full bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-3xl font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-blue-600/40 transition-all hover:-translate-y-1 active:scale-95"
                            >
                                Enviar e Finalizar
                            </button>
                        </div>
                    </template>
                    
                    <template x-if="submitted">
                        <div class="space-y-6 animate-in fade-in zoom-in duration-500">
                            <h2 class="text-4xl font-extrabold tracking-tight text-blue-400">Sucesso!</h2>
                            <p class="text-gray-400">Suas respostas foram enviadas. Nossa equipe entrará em contato em breve.</p>
                        </div>
                    </template>
                </div>

            </form>
        </div>
    </div>

    <script>
        function quiz() {
            return {
                currentStep: 0,
                submitted: false,
                progress: 0,
                questions: [
                    { id: 'faturamento', text: 'Qual é o faturamento atual da sua empresa?', subtext: 'Selecione a faixa aproximada', type: 'select', options: ['0-10k', '10-50k', '50-200k', '200k+'] },
                    { id: 'investimento', text: 'Quanto pretende investir em tráfego pago?', subtext: 'Investimento mensal desejado', type: 'select', options: ['Até R$ 1.000', 'R$ 1.000 - R$ 3.000', 'R$ 3.000 - R$ 5.000', 'R$ 10.000+'] },
                    { id: 'instagram', text: 'Qual o Instagram da sua empresa?', subtext: '@usuario', type: 'input', placeholder: '@empresa' },
                    { id: 'ramo', text: 'Qual é o ramo da sua empresa?', subtext: 'Ex: E-commerce, Saúde, Educação...', type: 'input', placeholder: 'Sua área de atuação' },
                    { id: 'faz_trafego', text: 'Você já faz tráfego pago atualmente?', subtext: 'Facebook, Google, etc.', type: 'select', options: ['Sim, já invisto', 'Não, comecei agora', 'Já fiz, mas parei'] },
                    { id: 'objetivo', text: 'Qual seu objetivo principal?', subtext: 'O que você espera alcançar?', type: 'input', placeholder: 'Vendas, Leads, Reconhecimento...' },
                    { id: 'nome', text: 'Qual seu nome?', subtext: 'Como podemos te chamar?', type: 'input', placeholder: 'Seu nome completo' },
                    { id: 'email', text: 'Seu melhor e-mail?', subtext: 'Para enviarmos a proposta', type: 'email', placeholder: 'nome@exemplo.com' },
                    { id: 'telefone', text: 'Telefone com DDD?', subtext: 'WhatsApp para contato rápido', type: 'tel', placeholder: '(00) 00000-0000' }
                ],
                answers: {},
                init() {
                    this.updateProgress();
                },
                nextStep() {
                    if (this.currentStep < this.questions.length) {
                        this.currentStep++;
                        this.updateProgress();
                    }
                },
                prevStep() {
                    if (this.currentStep > 0) {
                        this.currentStep--;
                        this.updateProgress();
                    }
                },
                updateProgress() {
                    this.progress = ((this.currentStep) / this.questions.length) * 100;
                },
                async submitQuiz() {
                    try {
                        const response = await fetch('/api/new-lead.php', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(this.answers)
                        });
                        
                        if (response.ok) {
                            this.submitted = true;
                        } else {
                            alert('Erro ao enviar dados. Tente novamente.');
                        }
                    } catch (error) {
                        console.error('Error:', error);
                        alert('Erro de conexão.');
                    }
                }
            }
        }
    </script>
</body>
</html>
