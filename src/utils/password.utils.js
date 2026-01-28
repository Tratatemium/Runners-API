const bcrypt = require("bcrypt");

const saltRounds = 10;
const algorithm = "bcrypt";
const DUMMY_HASH =
  "$2b$10$CwTycUXWue0Thq9StjUM0uJ8pJ6D0sJ1uQe8kJZ9nY9E6kKq6Zq9W";

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


  module.exports = { createPasswordHash }