/* RMIT University Vietnam
Course: COSC2430 Web Programming
Semester: 2023A
Assessment: Assignment 2
Author/ID: 
Celina Vangstrup s3993395
Doan Tran Thien Phuc s3926377
Le Duy Quang s3912105
Gustav Joachim Elbroend s3995055
Damien Vincent Voelker s3995378
Acknowledgement: RMIT Lecture Slide, https://www.makeuseof.com/nodejs-bcrypt-hash-verify-salt-password/*/


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