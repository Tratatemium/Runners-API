const userRepo = require("../repositories/users.repository.js");

const attachUser = async (req, res, next) => {
  const userId = req.user.userId;
  if (!userId) throw new Error("Missing userId from decoded token.");

  const user = await userRepo.findUserById(userId);
  if (!user) {
    const err = new Error("User not found.");
    err.status = 404;
    throw err;
  }

  req.userDoc = user;

  next();
};

module.exports = { attachUser };
