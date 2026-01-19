const bcrypt = require("bcrypt");

const saltRounds = 10;
const algorithm = "bcrypt";

const createPasswordHash = async (plainTextPassword) => {
  const hash = await bcrypt.hash(plainTextPassword, saltRounds);
  const hashedPassword = {
    hash,
    algorithm,
    updatedAt: new Date(),
    failedLoginAttempts: 0,
    lockUntil: null,
  };
  return hashedPassword;
};

module.exports = {
  createPasswordHash,
};
