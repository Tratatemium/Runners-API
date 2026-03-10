const jwt = require("jsonwebtoken");

const getTokenKey = () => {
  const tokenKey = process.env.TOKEN_KEY;

  if (!tokenKey) {
    throw new Error(
      "TOKEN_KEY environment variable is not set. Required to sign and verify JWTs.",
    );
  }

  return tokenKey;
};

const createToken = (user) => {
  const payload = {
    userId: user.userId,
    role: user.role,
    username: user.account.username,
    email: user.account.email,
    accessTokenVersion: user.auth.accessTokenVersion,
  };
  const options = {
    algorithm: "HS256",
    expiresIn: "1h",
    issuer: "runners-api",
  };

  const token = jwt.sign(payload, getTokenKey(), options);
  return token;
};

const verifyToken = (token) => {
  const options = {
    algorithms: ["HS256"],
    issuer: "runners-api",
  };
  const decoded = jwt.verify(token, getTokenKey(), options);
  return decoded;
};

module.exports = { createToken, verifyToken };
