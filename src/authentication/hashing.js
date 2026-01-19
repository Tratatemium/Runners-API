const bcrypt = require("bcrypt");

const saltRounds = 10;
const algorithm = "bcrypt";

const createPasswordHash = async (plainTextPassword) => {
  const passwordHash = await bcrypt.hash(plainTextPassword, saltRounds);
  const passwordMetadata = {
    algorithm,
    updatedAt: new Date(),
    failedLoginAttempts: 0,
    lockUntil: null,
  };
  return { passwordHash, passwordMetadata };
};

module.exports = {
  createPasswordHash,
};
