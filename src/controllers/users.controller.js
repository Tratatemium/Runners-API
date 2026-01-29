const auth = require("../services/auth.service.js");
const userRepo = require("../repositories/users.repository.js");

const createUser = async (req, res) => {
  const { email, username, password } = req.body;
  const newUserId = await auth.signup(email, username, password);
  res.status(201).json({ id: newUserId });
};

const loginUser = async (req, res) => {
  const { email, username, password } = req.body;
  const token = await auth.login(email, password);
  res.status(200).json({ token });
};

const getMe = (req, res) => {
  const userData = req.userDoc;
  console.log(userData)
  const { _id, credentials, ...safeData } = userData._doc;
  console.log(safeData)
  res.status(200).json(safeData);
};

// TODO: this functionality is used by GET users/:id, this should be refactored into admin route
const getUserById = async (req, res) => {
  const userData = await userRepo.findUserById(req.params["id"]);
  const { _id, credentials, ...safeData } = userData;
  res.status(200).json(safeData);
};

module.exports = { createUser, loginUser, getMe, getUserById };
