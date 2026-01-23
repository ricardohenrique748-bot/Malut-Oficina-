<?php
require_once '../config.php';
$_SESSION = array();
session_destroy();
header('Location: /admin/login.php');
exit;
?>
