const jwt = require("jsonwebtoken");

// RS256 keys
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const PUBLIC_KEY = process.env.PUBLIC_KEY;

// Create token
const createToken = async (user) => {
  const payload = { userId: user.id, username: user.username, email: user.email };
  const options = {
    algorithm: "RS256",
    expiresIn: "15m",
    issuer: "runners-api",
  };

  return new Promise((resolve, reject) => {
    jwt.sign(payload, PRIVATE_KEY, options, (err, token) =>
      err ? reject(err) : resolve(token)
    );
  });
};

// Verify token
const verifyToken = async (token) => {
  const options = {
    algorithms: ["RS256"],
    issuer: "runners-api",
  };

  return new Promise((resolve, reject) => {
    jwt.verify(token, PUBLIC_KEY, options, (err, decoded) =>
      err ? reject(err) : resolve(decoded)
    );
  });
};

module.exports = { createToken, verifyToken };