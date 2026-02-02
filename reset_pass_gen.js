const bcrypt = require('bcryptjs');

async function generate() {
    // Hash for 'malut123'
    const hash = await bcrypt.hash('malut123', 10);
    console.log(hash);
}

generate();
