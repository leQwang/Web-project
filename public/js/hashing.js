//https://www.makeuseof.com/nodejs-bcrypt-hash-verify-salt-password/
const bcrypt = require('bcrypt');

const hashPassword = async (password) => {
  const saltRounds = 10;
  const salt = await bcrypt.genSalt(saltRounds);
  const hash = await bcrypt.hash(password, salt);
  return hash;
};

const decryptHashedPassword = async (passwordPlain, hashedPassword) => {
  const isMatch = await bcrypt.compare(passwordPlain, hashedPassword);
  return isMatch;
};

module.exports = { hashPassword, decryptHashedPassword };