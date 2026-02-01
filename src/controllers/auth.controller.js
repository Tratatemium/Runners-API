const authService = require("../services/auth.service.js");

const createUser = async (req, res) => {
  const { email, username, password } = req.body;
  const newUserId = await authService.signup(email, username, password);
  res.status(201).json({ id: newUserId });
};

const loginUser = async (req, res) => {
  const { email, username, password } = req.body;
  const identifier = email ? email : username;
  const token = await authService.login(identifier, password);
  res.status(200).json({ token });
};

const logoutAll = async (req, res) => {
  const { userId } = req.user;
  await authService.invalidatePreviousAccessTokens(userId);
  res.sendStatus(200);
};

module.exports = {
  createUser,
  loginUser,
  logoutAll,
};
