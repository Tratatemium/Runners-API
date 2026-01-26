const { verifyToken } = require("../authentication/jwt.js");

const throwAuthError = (message, status = 401) => {
  const err = new Error(message);
  err.status = status;
  throw err;
};

const authMiddleware = (req, res, next) => {
  const header = req.headers.authorization;
  // Expected format: "Bearer <token>"
  if (!header || !header.startsWith("Bearer ")) {
    throwAuthError("Invalid authorization header.");
  }

  const token = header.slice(7);

  const decodedUser = verifyToken(token);
  req.decodedUser = decodedUser;
  next();
};

module.exports = { authMiddleware };
