const { verifyToken } = require("../authentication/jwt.js");

const throwAuthError = (message, status = 401) => {
  const err = new Error(message);
  err.status = status;
  throw err;
};

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  // Expected format: "Bearer <token>"

  const isAuthHeaderCorrect = authHeader && authHeader.startsWith("Bearer ");
  if (!isAuthHeaderCorrect) {
    throwAuthError("Invalid authorization header.");
  }

  const token = authHeader.substring(7);

  if (!token) {
    throwAuthError("No token provided.");
  }

  try {
    const decodedUser = verifyToken(token);
    req.decodedUser = decodedUser;
    next();
  } catch (err) {
    next(err);
  }
};


module.exports = { authMiddleware };