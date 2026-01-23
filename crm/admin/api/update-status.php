<?php
require_once '../../config.php';
require_auth();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = (int)($_POST['id'] ?? 0);
    $status = $_POST['status'] ?? '';
    
    $valid_statuses = ['cold', 'warm', 'hot', 'ultra_hot'];
    
    if ($id > 0 && in_array($status, $valid_statuses)) {
        $db = get_db_connection();
        $stmt = $db->prepare("UPDATE leads SET status_kanban = ? WHERE id = ?");
        $stmt->bind_param("si", $status, $id);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'error' => $db->error]);
        }
    } else {
        echo json_encode(['success' => false, 'error' => 'Invalid data']);
    }
}
?>
