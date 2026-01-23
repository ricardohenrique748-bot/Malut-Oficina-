
-- Create ADMIN Role if not exists
INSERT INTO roles (id, name, description) 
SELECT 'role_admin_001', 'ADMIN', 'Administrator with full access'
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'ADMIN');

-- Update roleId variable if it already existed (subquery magic not needed if we hardcode access, but let's assume we use the hardcoded ID for simplicity or look it up)
-- Actually, easier to just UPSERT logic for user.

-- Insert User
INSERT INTO users (id, name, email, passwordHash, roleId, active, createdAt, updatedAt)
VALUES ('user_admin_001', 'Ricardo Luz', 'ricardo.luz@eunaman.com.br', '$2a$10$L8ZwvTL.WxTxZWqWCNcEtOogzdOTYKzK7GOfjDhYlNmmNP89lve8m', 
        (SELECT id FROM roles WHERE name='ADMIN' LIMIT 1), 
        1, '2026-01-02 20:27:17', '2026-01-02 20:27:17')
ON DUPLICATE KEY UPDATE 
    passwordHash='$2a$10$L8ZwvTL.WxTxZWqWCNcEtOogzdOTYKzK7GOfjDhYlNmmNP89lve8m', 
    active=1,
    roleId=(SELECT id FROM roles WHERE name='ADMIN' LIMIT 1),
    updatedAt='2026-01-02 20:27:17';
