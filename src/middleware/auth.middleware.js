const { verifyToken } = require("../authentication/jwt.js");

const throwAuthError = (message, status = 401) => {
  const err = new Error(message);
  err.status = status;
  throw err;
};

const checkAuth = (req, res, next) => {
  const header = req.headers.authorization;
  // Expected format: "Bearer <token>"
  if (!header || !header.startsWith("Bearer ")) {
    throwAuthError("Invalid authorization header.");
  }

  const token = header.slice(7);

  const userData = verifyToken(token);
  req.user = userData;
  next();
};

const checkOwnership = (param = "id") => {
  return (req, res, next) => {
    const resourceId = req.params[param];
    const providedId = req.user.userId;
    if (providedId !== resourceId) {
      return res
        .status(403)
        .json({ error: "You are not allowed to perform this action." });
    }
    next();
  };
};

module.exports = { checkAuth, checkOwnership };
