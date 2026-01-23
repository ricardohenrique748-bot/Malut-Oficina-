<?php
require_once '../config.php';
require_auth();

$id = (int)($_GET['id'] ?? 0);
$db = get_db_connection();

// Handle Re-analyze Request
if (isset($_POST['reanalyze'])) {
    $result = $db->query("SELECT * FROM leads WHERE id = $id");
    $leadData = $result->fetch_assoc();
    
    // Simulate API call to Gemini (imported from api/new-lead.php logic)
    // Note: In a real project, we would refactor the AI logic into a helper class
    require_once '../api/new-lead.php'; // Reuse logic
    unset($_POST['reanalyze']);
}

$result = $db->query("SELECT * FROM leads WHERE id = $id");
$lead = $result->fetch_assoc();

if (!$lead) {
    die("Lead não encontrado.");
}

$tags = json_decode($lead['tags_ai'] ?? '[]', true);
?>
<!DOCTYPE html>
<html lang="pt-BR" class="h-full">
<head>
    <meta charset="UTF-8">
    <title>Detalhes do Lead | Malut Admin</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Plus Jakarta Sans', sans-serif; background: #070d17; }
    </style>
</head>
<body class="h-full text-white">

    <nav class="sticky top-0 z-50 bg-[#070d17]/80 backdrop-blur-xl border-b border-white/5 px-8 h-20 flex items-center justify-between">
        <div class="flex items-center gap-6">
            <a href="kanban.php" class="p-2 hover:bg-white/5 rounded-xl transition-colors text-gray-400">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            </a>
            <h1 class="text-xl font-extrabold tracking-tight">Lead <span class="text-blue-500">Details</span></h1>
        </div>
        <div class="flex items-center gap-4">
            <form action="" method="POST">
                <button name="reanalyze" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                    Reanalisar IA
                </button>
            </form>
        </div>
    </nav>

    <main class="max-w-6xl mx-auto p-8 lg:p-12">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            <!-- Left: Core Info -->
            <div class="lg:col-span-2 space-y-12">
                <!-- Profile Header -->
                <div class="flex items-start gap-8">
                    <div class="h-24 w-24 bg-blue-600/10 border border-blue-500/20 rounded-[2rem] flex items-center justify-center text-blue-500 text-4xl font-black">
                        <?php echo strtoupper($lead['nome'][0]); ?>
                    </div>
                    <div class="space-y-4">
                        <h2 class="text-4xl font-extrabold tracking-tight"><?php echo htmlspecialchars($lead['nome']); ?></h2>
                        <div class="flex flex-wrap gap-4 text-sm text-gray-500">
                            <span class="flex items-center gap-2">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                <?php echo htmlspecialchars($lead['email']); ?>
                            </span>
                            <span class="flex items-center gap-2">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                                <?php echo htmlspecialchars($lead['telefone']); ?>
                            </span>
                            <span class="flex items-center gap-2">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                                <?php echo htmlspecialchars($lead['instagram']); ?>
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Responses Section -->
                <div class="space-y-8">
                    <h3 class="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600">Respostas do Quiz</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <?php 
                        $fields = [
                            'Ramo' => 'ramo',
                            'Faturamento' => 'faturamento_raw',
                            'Investimento' => 'invest_raw',
                            'Objetivo' => 'objetivo',
                            'Faz Tráfego' => 'faz_trafego'
                        ];
                        foreach ($fields as $label => $key):
                        ?>
                        <div class="bg-white/5 border border-white/10 p-6 rounded-3xl space-y-2">
                            <p class="text-[8px] font-black uppercase tracking-widest text-gray-500"><?php echo $label; ?></p>
                            <p class="text-sm font-bold text-gray-200"><?php echo htmlspecialchars($lead[$key]); ?></p>
                        </div>
                        <?php endforeach; ?>
                    </div>
                </div>
            </div>

            <!-- Right: AI Qualification Sidebar -->
            <div class="space-y-8">
                <div class="bg-blue-600 p-8 rounded-[3rem] shadow-2xl shadow-blue-600/20 space-y-8 relative overflow-hidden">
                    <div class="absolute -right-4 -top-4 opacity-10">
                        <svg class="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71L12 2z"></path></svg>
                    </div>

                    <div class="space-y-2">
                        <h3 class="text-[10px] font-black uppercase tracking-widest text-blue-200">AI Qualification Score</h3>
                        <div class="flex items-baseline gap-2">
                            <span class="text-6xl font-black"><?php echo $lead['score_potencial']; ?></span>
                            <span class="text-blue-200 font-bold">%</span>
                        </div>
                    </div>

                    <div class="space-y-6">
                        <div class="space-y-1">
                            <p class="text-[8px] font-black uppercase tracking-widest text-blue-200">Urgência</p>
                            <p class="text-xl font-extrabold capitalize"><?php echo $lead['urgencia']; ?></p>
                        </div>

                        <div class="space-y-1">
                            <p class="text-[8px] font-black uppercase tracking-widest text-blue-200">Categoria Financeira</p>
                            <p class="text-xl font-extrabold"><?php echo $lead['faturamento_categoria']; ?></p>
                        </div>
                    </div>

                    <div class="pt-6 border-t border-white/20">
                        <h4 class="text-[10px] font-black uppercase tracking-widest text-blue-200 mb-4">Insights da IA</h4>
                        <div class="flex flex-wrap gap-2">
                            <?php foreach ($tags as $tag): ?>
                                <span class="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-xl text-[9px] font-bold uppercase tracking-widest"><?php echo htmlspecialchars($tag); ?></span>
                            <?php endforeach; ?>
                        </div>
                    </div>
                </div>

                <!-- AI Summary -->
                <div class="bg-white/5 border border-white/10 p-8 rounded-[3rem] space-y-4">
                    <h3 class="text-[10px] font-black uppercase tracking-widest text-gray-500">Resumo Estratégico</h3>
                    <p class="text-sm text-gray-400 leading-relaxed font-medium">
                        <?php echo nl2br(htmlspecialchars($lead['resumo_ai'])); ?>
                    </p>
                </div>
            </div>

        </div>
    </main>
</body>
</html>
