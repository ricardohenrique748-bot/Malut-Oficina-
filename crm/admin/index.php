<?php
require_once '../config.php';
if (is_logged_in()) {
    header('Location: /admin/kanban.php');
} else {
    header('Location: /admin/login.php');
}
exit;
?>
