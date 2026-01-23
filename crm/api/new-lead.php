<?php
/**
 * Malut CRM - New Lead API (With Gemini AI Qualification)
 */

require_once '../config.php';

// Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Get JSON Input
$rawData = file_get_contents('php://input');
$data = json_decode($rawData, true);

if (!$data || !isset($data['email'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid data']);
    exit;
}

// Prepare Data
$nome = $data['nome'] ?? '';
$email = $data['email'] ?? '';
$telefone = $data['telefone'] ?? '';
$instagram = $data['instagram'] ?? '';
$ramo = $data['ramo'] ?? '';
$faturamento_raw = $data['faturamento'] ?? '';
$invest_raw = $data['investimento'] ?? '';
$objetivo = $data['objetivo'] ?? '';
$faz_trafego = $data['faz_trafego'] ?? '';

/**
 * GEMINI AI QUALIFICATION
 */
$ai_result = qualifyWithAI($data);

$faturamento_categoria = $ai_result['faturamento_categoria'] ?? 'Unknown';
$invest_categoria = $ai_result['invest_categoria'] ?? 'Unknown';
$tags_ai = isset($ai_result['tags_ai']) ? json_encode($ai_result['tags_ai']) : '[]';
$score_potencial = $ai_result['score_potencial'] ?? 0;
$urgencia = $ai_result['urgencia'] ?? 'baixa';
$resumo_ai = $ai_result['resumo'] ?? '';

// Determine Kanban Status based on Revenue
$status_kanban = 'cold';
if ($faturamento_categoria === '200k+') $status_kanban = 'ultra_hot';
else if ($faturamento_categoria === '50-200k') $status_kanban = 'hot';
else if ($faturamento_categoria === '10-50k') $status_kanban = 'warm';

// Save to DB
$db = get_db_connection();
$stmt = $db->prepare("INSERT INTO leads (nome, email, telefone, instagram, ramo, faturamento_raw, faturamento_categoria, invest_raw, invest_categoria, objetivo, faz_trafego, tags_ai, score_potencial, urgencia, resumo_ai, status_kanban) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

$stmt->bind_param("ssssssssssssisss", 
    $nome, $email, $telefone, $instagram, $ramo, 
    $faturamento_raw, $faturamento_categoria, 
    $invest_raw, $invest_categoria, 
    $objetivo, $faz_trafego, 
    $tags_ai, $score_potencial, $urgencia, $resumo_ai, $status_kanban
);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'id' => $db->insert_id]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $db->error]);
}

/**
 * AI Logic
 */
function qualifyWithAI($data) {
    if (GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
        // Mock data or fallback if no key provided
        return [
            'faturamento_categoria' => $data['faturamento'] ?? '0-10k',
            'invest_categoria' => '3k',
            'tags_ai' => ['Falta configuração API', 'Lead Manual'],
            'score_potencial' => 50,
            'urgencia' => 'média',
            'resumo' => 'API Key não configurada. Categorização básica ativa.'
        ];
    }

    $prompt = "Você é um assistente de qualificação de leads para uma agência de tráfego pago. Receba as respostas abaixo e devolva um JSON contendo: faturamento_categoria (0-10k, 10-50k, 50-200k, 200k+), invest_categoria (1k, 3k, 5k, 10k, 10k+), tags_ai = lista com insights do lead, score_potencial (0-100), urgencia (baixa, média, alta), resumo = descrição curta do potencial do lead. Responda apenas com JSON puro. Respostas: " . json_encode($data);

    $url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" . GEMINI_API_KEY;

    $payload = [
        "contents" => [
            ["parts" => [["text" => $prompt]]]
        ]
    ];

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    
    $response = curl_exec($ch);
    curl_close($ch);

    $result = json_decode($response, true);
    $text = $result['candidates'][0]['content']['parts'][0]['text'] ?? '';
    
    // Extract JSON from text (in case AI wraps it in backticks)
    if (preg_match('/\{.*\}/s', $text, $matches)) {
        return json_decode($matches[0], true);
    }

    return [];
}
?>
