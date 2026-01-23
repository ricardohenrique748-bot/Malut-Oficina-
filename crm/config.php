<?php
/**
 * Malut CRM - Configuration
 */

// Database Configuration
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'crm_db');

// Gemini AI Configuration
// Get your key at: https://aistudio.google.com/app/apikey
define('GEMINI_API_KEY', 'YOUR_GEMINI_API_KEY_HERE');

// Authentication
define('ADMIN_USER', 'admin');
define('ADMIN_PASS', 'admin123'); // Change this in production

// Session Start
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

/**
 * DB Connection Singleton/Helper
 */
function get_db_connection() {
    static $conn = null;
    if ($conn === null) {
        $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
        if ($conn->connect_error) {
            die("Connection failed: " . $conn->connect_error);
        }
        $conn->set_charset("utf8mb4");
    }
    return $conn;
}

/**
 * Simple Auth Helper
 */
function is_logged_in() {
    return isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true;
}

function require_auth() {
    if (!is_logged_in()) {
        header('Location: /admin/login.php');
        exit;
    }
}
?>
