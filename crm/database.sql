CREATE DATABASE IF NOT EXISTS crm_db;
USE crm_db;

CREATE TABLE IF NOT EXISTS leads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    telefone VARCHAR(50),
    instagram VARCHAR(255),
    ramo VARCHAR(255),
    faturamento_raw TEXT,
    faturamento_categoria VARCHAR(50),
    invest_raw TEXT,
    invest_categoria VARCHAR(50),
    objetivo TEXT,
    faz_trafego VARCHAR(50),
    tags_ai TEXT,
    score_potencial INT DEFAULT 0,
    urgencia VARCHAR(20),
    resumo_ai TEXT,
    status_kanban VARCHAR(50) DEFAULT 'cold',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX (status_kanban),
    INDEX (score_potencial)
);

-- Optional: Create an admin user table if not using hardcoded auth
CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Default admin: admin / admin123 (use password_hash in production)
-- INSERT INTO admins (username, password) VALUES ('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');
