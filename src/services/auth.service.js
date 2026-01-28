
const db = require("../database.js");
const { createPasswordHash } = require ("../utils/password.utils.js")
const { createToken } = require("../utils/jwt.utils.js");





const login = async (email, password) => {
  const foundUser = await db.findUserByField("account.email", email);

  const passwordHash = foundUser
    ? foundUser.credentials.passwordHash
    : DUMMY_HASH;
  const isPasswordCorrect = await bcrypt.compare(password, passwordHash);

  if (!foundUser || !isPasswordCorrect) {
    const err = new Error("Invalid credentials");
    err.status = 401;
    throw err;
  }

  const token = createToken(foundUser);
  await db.updateLastLogin(foundUser);
  return token;
};

module.exports = {
  createPasswordHash,
  login,
};
