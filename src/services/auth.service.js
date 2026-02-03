const userRepo = require("../repositories/users.repository.js");
const {
  createPasswordHash,
  comparePasswordHash,
} = require("../utils/password.utils.js");
const { createToken } = require("../utils/jwt.utils.js");

const signup = async (email, username, password) => {
  const { passwordHash, passwordMetadata } = await createPasswordHash(password);
  const newUser = {
    role: "user",
    credentials: { passwordHash, passwordMetadata },
    auth: {
      accessTokenVersion: 0,
    },
    account: {
      username,
      email,
      lastLogin: null,
    },
    profile: {},
  };

  const newUserId = await userRepo.addNewUser(newUser);
  return newUserId;
};

const updatePassword = async (userId, newPassword) => {
  const newCredentials = await createPasswordHash(newPassword);
  const result = await userRepo.updateCredentials(userId, newCredentials);
  return result;
};

const authenticateUser = async (identifier, password) => {
  const user = await userRepo.findUserByEmailOrUsername(identifier);
  await comparePasswordHash(user, password);
  return user;
};

const login = async (identifier, password) => {
  const user = await authenticateUser(identifier, password);
  //TODO: implement failed login attempts check
  const token = createToken(user);
  await userRepo.updateLastLogin(user);
  return token;
};

// NOTE: change this if refresh tokens are implemented to generalized func
const invalidatePreviousAccessTokens = async (userId) => {
  await userRepo.incrementAccessTokenVersion(userId);
};

module.exports = {
  signup,
  updatePassword,
  authenticateUser,
  login,
  invalidatePreviousAccessTokens,
};
