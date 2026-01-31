const { verifyToken } = require("../utils/jwt.utils.js");
const userRepo = require("../repositories/users.repository.js");

const throwAuthError = (message, status = 401) => {
  const err = new Error(message);
  err.status = status;
  throw err;
};

const checkAuth = async (req, res, next) => {
  const header = req.headers.authorization; // Expected format: "Bearer <token>"
  if (!header || !header.startsWith("Bearer ")) {
    throwAuthError("Invalid authorization header.");
  }

  const token = header.slice(7);
  const userData = verifyToken(token);

  const storedUser = await userRepo.findUserById(userData.userId);
  if (!storedUser) throwAuthError("Invalid token.");

  const incomingVersion = userData.accessTokenVersion;
  const storedVersion = storedUser.auth.accessTokenVersion;

  if (
    incomingVersion == null ||
    storedVersion == null ||
    incomingVersion !== storedVersion
  ) {
    throwAuthError("Invalid token.");
  }

  req.user = userData;
  next();
};

module.exports = { checkAuth };
