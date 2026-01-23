<?php
require_once '../config.php';
require_auth();

$db = get_db_connection();

// Status/Columns
$columns = [
    'cold' => ['label' => 'Cold (0-10k)', 'border' => 'border-slate-800'],
    'warm' => ['label' => 'Morno (10-50k)', 'border' => 'border-orange-900/40'],
    'hot' => ['label' => 'Quente (50-200k)', 'border' => 'border-blue-900/40'],
    'ultra_hot' => ['label' => 'Ultra Quente (200k+)', 'border' => 'border-indigo-900/40']
];

$leads = [];
foreach ($columns as $status => $info) {
    $result = $db->query("SELECT * FROM leads WHERE status_kanban = '$status' ORDER BY score_potencial DESC");
    $leads[$status] = $result->fetch_all(MYSQLI_ASSOC);
}
?>
<!DOCTYPE html>
<html lang="pt-BR" class="h-full">
<head>
    <meta charset="UTF-8">
    <title>CRM Dashboard | Malut Admin</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/sortablejs@1.15.0/Sortable.min.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Plus Jakarta Sans', sans-serif; background: #070d17; }
        .kanban-column { min-height: calc(100vh - 200px); }
        .card-ghost { opacity: 0.4; border: 2px dashed #3b82f6 !important; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
    </style>
</head>
<body class="h-full text-white">

    <!-- Navbar -->
    <nav class="sticky top-0 z-50 bg-[#070d17]/80 backdrop-blur-xl border-b border-white/5 px-8 h-20 flex items-center justify-between">
        <div class="flex items-center gap-12">
            <h1 class="text-xl font-extrabold tracking-tight">Malut <span class="text-blue-500">CRM</span></h1>
            <div class="hidden md:flex gap-8 text-[10px] font-black uppercase tracking-widest text-gray-400">
                <a href="#" class="text-white">Pipeline Leads</a>
                <a href="#" class="hover:text-white transition-colors">Relatórios</a>
                <a href="#" class="hover:text-white transition-colors">Usuários</a>
            </div>
        </div>
        <div class="flex items-center gap-6">
            <div class="text-right hidden sm:block">
                <p class="text-xs font-bold"><?php echo ADMIN_USER; ?></p>
                <p class="text-[9px] text-gray-500 uppercase tracking-widest font-black">Administrador</p>
            </div>
            <a href="logout.php" class="p-2 hover:bg-white/5 rounded-xl transition-colors text-gray-400 hover:text-red-400">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            </a>
        </div>
    </nav>

    <main class="p-8">
        <!-- Header Section -->
        <div class="flex flex-col md:flex-row justify-between md:items-end gap-6 mb-12">
            <div>
                <h2 class="text-3xl font-bold tracking-tight mb-2">Lead Pipeline</h2>
                <p class="text-gray-500 text-sm">Gerencie o fluxo de qualificação inteligente dos seus leads.</p>
            </div>
            <div class="flex items-center gap-4">
                <div class="bg-blue-600/10 border border-blue-500/20 px-4 py-3 rounded-2xl flex items-center gap-3">
                    <span class="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
                    <span class="text-[10px] font-bold uppercase tracking-widest text-blue-400">AI Qualification Ativa</span>
                </div>
            </div>
        </div>

        <!-- Kanban Board -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-start overflow-x-auto pb-8 scrollbar-hide">
            
            <?php foreach ($columns as $id => $info): ?>
                <div class="flex flex-col gap-4 min-w-[300px]">
                    <!-- Column Header -->
                    <div class="flex justify-between items-center px-2">
                        <h3 class="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                            <?php echo $info['label']; ?>
                            <span class="ml-2 text-gray-700"><?php echo count($leads[$id]); ?></span>
                        </h3>
                        <div class="h-1 w-12 bg-white/5 rounded-full"></div>
                    </div>

                    <!-- Cards Container -->
                    <div id="col-<?php echo $id; ?>" data-status="<?php echo $id; ?>" class="kanban-column space-y-4 p-2 rounded-2xl transition-all <?php echo $info['border']; ?> border-t-4">
                        <?php foreach ($leads[$id] as $lead): 
                            $tags = json_decode($lead['tags_ai'] ?? '[]', true);
                            $score = (int)$lead['score_potencial'];
                            $borderColor = $score > 80 ? 'border-blue-500/30' : ($score > 50 ? 'border-indigo-500/20' : 'border-white/5');
                        ?>
                            <div 
                                data-id="<?php echo $lead['id']; ?>" 
                                class="bg-[#101928] border <?php echo $borderColor; ?> p-5 rounded-3xl shadow-lg cursor-grab active:cursor-grabbing hover:border-blue-500/40 hover:-translate-y-1 transition-all group relative overflow-hidden"
                            >
                                <!-- Score Indicator -->
                                <div class="absolute top-0 right-0 p-4">
                                    <div class="text-[9px] font-black tracking-widest <?php echo $score > 70 ? 'text-blue-400' : 'text-gray-600'; ?>">
                                        <?php echo $score; ?>%
                                    </div>
                                </div>

                                <!-- Card Content -->
                                <div class="space-y-4">
                                    <div>
                                        <h4 class="font-bold text-sm text-gray-200"><?php echo htmlspecialchars($lead['nome']); ?></h4>
                                        <p class="text-[10px] text-gray-500 uppercase font-black tracking-widest mt-0.5"><?php echo htmlspecialchars($lead['ramo']); ?></p>
                                    </div>

                                    <div class="grid grid-cols-2 gap-4">
                                        <div>
                                            <p class="text-[8px] text-gray-600 font-black uppercase tracking-widest mb-1">Faturamento</p>
                                            <p class="text-[10px] font-bold text-gray-400"><?php echo htmlspecialchars($lead['faturamento_raw']); ?></p>
                                        </div>
                                        <div>
                                            <p class="text-[8px] text-gray-600 font-black uppercase tracking-widest mb-1">Investimento</p>
                                            <p class="text-[10px] font-bold text-gray-400"><?php echo htmlspecialchars($lead['invest_raw']); ?></p>
                                        </div>
                                    </div>

                                    <!-- AI Tags -->
                                    <div class="flex flex-wrap gap-1">
                                        <?php foreach (array_slice($tags, 0, 3) as $tag): ?>
                                            <span class="text-[8px] font-black uppercase tracking-widest px-2 py-1 bg-blue-500/10 text-blue-400/80 rounded-md border border-blue-500/5"><?php echo htmlspecialchars($tag); ?></span>
                                        <?php endforeach; ?>
                                    </div>

                                    <div class="pt-4 flex items-center justify-between border-t border-white/5">
                                        <a href="details.php?id=<?php echo $lead['id']; ?>" class="text-[10px] font-black uppercase tracking-widest text-blue-500 hover:text-white transition-colors">Detalhes</a>
                                        <span class="text-[8px] text-gray-700 font-bold"><?php echo date('d/m/y', strtotime($lead['created_at'])); ?></span>
                                    </div>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    </div>
                </div>
            <?php endforeach; ?>

        </div>
    </main>

    <script>
        document.addEventListener('DOMContentLoaded', () => {
            const columns = ['col-cold', 'col-warm', 'col-hot', 'col-ultra_hot'];
            
            columns.forEach(id => {
                new Sortable(document.getElementById(id), {
                    group: 'leads',
                    animation: 300,
                    ghostClass: 'card-ghost',
                    onEnd: async (evt) => {
                        const leadId = evt.item.dataset.id;
                        const newStatus = evt.to.dataset.status;
                        
                        try {
                            const formData = new FormData();
                            formData.append('id', leadId);
                            formData.append('status', newStatus);
                            
                            await fetch('api/update-status.php', {
                                method: 'POST',
                                body: formData
                            });
                        } catch (error) {
                            console.error('Update failed:', error);
                        }
                    }
                });
            });
        });
    </script>
</body>
</html>
