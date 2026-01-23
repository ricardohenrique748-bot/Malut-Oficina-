const bcrypt = require('bcryptjs');
const fs = require('fs');

async function go() {
    const password = '15975321';
    const hash = await bcrypt.hash(password, 10);

    const roleId = 'role_admin_001';
    const userId = 'user_admin_001';
    const email = 'ricardo.luz@eunaman.com.br';
    const name = 'Ricardo Luz';
    // Timestamps
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const sql = `
-- Create ADMIN Role if not exists
INSERT INTO roles (id, name, description) 
SELECT '${roleId}', 'ADMIN', 'Administrator with full access'
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'ADMIN');

-- Update roleId variable if it already existed (subquery magic not needed if we hardcode access, but let's assume we use the hardcoded ID for simplicity or look it up)
-- Actually, easier to just UPSERT logic for user.

-- Insert User
INSERT INTO users (id, name, email, passwordHash, roleId, active, createdAt, updatedAt)
VALUES ('${userId}', '${name}', '${email}', '${hash}', 
        (SELECT id FROM roles WHERE name='ADMIN' LIMIT 1), 
        1, '${now}', '${now}')
ON DUPLICATE KEY UPDATE 
    passwordHash='${hash}', 
    active=1,
    roleId=(SELECT id FROM roles WHERE name='ADMIN' LIMIT 1),
    updatedAt='${now}';
`;

    fs.writeFileSync('create_admin_manual.sql', sql);
    console.log('SQL generated');
}

go();
