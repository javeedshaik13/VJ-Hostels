const bcrypt = require('bcrypt');

const passwords = ['wardena', 'wardenb'];  // List of passwords you want to hash
const saltRounds = 10;

passwords.forEach(async (password) => {
  const hash = await bcrypt.hash(password, saltRounds);
  console.log(`Hashed password for ${password}: ${hash}`);
});

