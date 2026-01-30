const auth = require("../services/auth.service.js");
const userService = require("../services/user.service.js");

const createUser = async (req, res) => {
  const { email, username, password } = req.body;
  const newUserId = await auth.signup(email, username, password);
  res.status(201).json({ id: newUserId });
};

const loginUser = async (req, res) => {
  const { email, username, password } = req.body;
  const identifier = email ? email : username;
  const token = await auth.login(identifier, password);
  res.status(200).json({ token });
};

const getMe = (req, res) => {
  const userData = req.userDoc;
  const { _id, credentials, ...safeData } = userData._doc;
  res.status(200).json(safeData);
};

const updateProfile = async (req, res) => {
  const userId = req.user.userId;
  const profile = req.body.profile;
  const savedProfile = await userService.updateProfile(userId, profile);
  res.status(200).json(savedProfile);
};

module.exports = { createUser, loginUser, getMe, updateProfile };
