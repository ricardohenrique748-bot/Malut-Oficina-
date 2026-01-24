const bcrypt = require('bcryptjs');
const fs = require('fs');

async function generate() {
    const hash = await bcrypt.hash('15975321', 10);
    fs.writeFileSync('new_hash.txt', hash);
}

generate();
