const bcrypt = require('bcryptjs');
bcrypt.hash('15975321', 10).then(hash => console.log(hash));
