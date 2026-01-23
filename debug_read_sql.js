const fs = require('fs');

try {
    const content = fs.readFileSync('database_mysql.sql', 'utf8');
    console.log(content.substring(0, 500));
} catch (e) {
    console.error(e);
}
