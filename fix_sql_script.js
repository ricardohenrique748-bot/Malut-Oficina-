const fs = require('fs');

try {
    // Read the Prisma-generated SQL (which is correct for the schema)
    // trying utf8 first, if it fails or looks weird we'll try to detect, but prisma output is usually utf8
    let sqlContent = fs.readFileSync('database_full_schema.sql', 'utf8');

    // If the file starts with BOM or weird chars, clean it
    if (sqlContent.charCodeAt(0) === 0xFEFF) {
        sqlContent = sqlContent.slice(1);
    }

    // Check if it looks like UTF-16 (sometimes PowerShell redirection does this)
    if (sqlContent.includes('\0')) {
        sqlContent = fs.readFileSync('database_full_schema.sql', 'utf16le');
    }

    // List of tables in correct dependency order (or just all tables since we disable FK checks)
    // We extracted these from the prisma schema viewing earlier
    const tables = [
        'users',
        'roles',
        'permissions',
        'role_permissions',
        'customers',
        'vehicles',
        'work_orders',
        'work_order_status_history',
        'work_order_items',
        'parts',
        'service_catalog',
        'stock_movements',
        'financial_records',
        'leads',
        'integration_tokens'
    ];

    let dropSection = '-- --------------------------------------------------------\n';
    dropSection += '-- DATASHEET RESET (DROP ALL TABLES)\n';
    dropSection += '-- --------------------------------------------------------\n\n';
    dropSection += 'SET FOREIGN_KEY_CHECKS=0;\n\n';

    tables.forEach(table => {
        dropSection += `DROP TABLE IF EXISTS \`${table}\`;\n`;
    });

    dropSection += '\nSET FOREIGN_KEY_CHECKS=1;\n\n';
    dropSection += '-- --------------------------------------------------------\n';
    dropSection += '-- RE-CREATE TABLES\n';
    dropSection += '-- --------------------------------------------------------\n\n';

    const finalContent = dropSection + sqlContent;

    fs.writeFileSync('database_mysql.sql', finalContent, 'utf8');
    console.log('Successfully updated database_mysql.sql with DROP statements.');

} catch (e) {
    console.error('Error processing SQL:', e);
}
