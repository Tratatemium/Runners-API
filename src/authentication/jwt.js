const jwt = require("jsonwebtoken");

const TOKEN_KEY = process.env.TOKEN_KEY;

if (!TOKEN_KEY) {
  throw new Error(
    "TOKEN_KEY environment variable is not set. It must be defined to sign and verify JWTs."
  );
}

const createToken = (user) => {
  const payload = {
    userId: user.userId,
    username: user.username,
    email: user.email,
  };
  const options = {
    algorithm: "HS256",
    expiresIn: "1h",
    issuer: "runners-api",
  };

  const token = jwt.sign(payload, TOKEN_KEY, options);
  return token;
};

const verifyToken = async (token) => {
  const options = {
    algorithms: ["HS256"],
    issuer: "runners-api",
  };
  const decoded = jwt.verify(token, TOKEN_KEY, options);
  return decoded;
};

module.exports = { createToken, verifyToken };
