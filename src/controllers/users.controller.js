const usersService = require("../services/users.service.js");
const authService = require("../services/auth.service.js");

const getMe = (req, res) => {
  const userData = req.userDoc;
  const { _id, credentials, ...safeData } = userData._doc;
  res.status(200).json(safeData);
};

const updateProfile = async (req, res) => {
  const userId = req.user.userId;
  const profile = req.body.profile;
  const savedProfile = await usersService.updateProfile(userId, profile);
  res.status(200).json(savedProfile);
};

const updateAccount = async (req, res) => {
  const { userId, email: currentEmail } = req.user;
  const currentPassword = req.body.currentPassword;
  await authService.authenticateUser(currentEmail, currentPassword);

  const fieldToUpdate = req.fieldToUpdate;
  if (!fieldToUpdate) {
    throw new Error("req.fieldToUpdate must be provided in middleware.");
  }
  await usersService.updateAccount(userId, fieldToUpdate, req.body);
  await authService.invalidatePreviousAccessTokens(userId);
  res.sendStatus(200);
};

module.exports = {
  getMe,
  updateProfile,
  updateAccount,
};
