const userRepo = require("../repositories/users.repository.js");
const {
  createPasswordHash,
  comparePasswordHash,
} = require("../utils/password.utils.js");
const { createToken } = require("../utils/jwt.utils.js");

const signup = async (email, username, password) => {
  const { passwordHash, passwordMetadata } = await createPasswordHash(password);
  const newUser = {
    credentials: { passwordHash, passwordMetadata },
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

const login = async (email, password) => {
  const foundUser = await userRepo.findUserByField("account.email", email);

  await comparePasswordHash(foundUser, password);

  //TODO: implement failed login attempts check

  const token = createToken(foundUser);
  await userRepo.updateLastLogin(foundUser);
  return token;
};

module.exports = {
  signup,
  login,
};
