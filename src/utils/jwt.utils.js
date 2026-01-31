const jwt = require("jsonwebtoken");
const { TOKEN_KEY } = require("../config/env.config.js");

const createToken = (user) => {
  const payload = {
    userId: user.userId,
    username: user.account.username,
    email: user.account.email,
    accessTokenVersion: user.auth.accessTokenVersion,
  };
  const options = {
    algorithm: "HS256",
    expiresIn: "1h",
    issuer: "runners-api",
  };

  const token = jwt.sign(payload, TOKEN_KEY, options);
  return token;
};

const verifyToken = (token) => {
  const options = {
    algorithms: ["HS256"],
    issuer: "runners-api",
  };
  const decoded = jwt.verify(token, TOKEN_KEY, options);
  return decoded;
};

module.exports = { createToken, verifyToken };
