const { parseAndValidateUser } = require("../validation/users.validation.js");
const auth = require("../authentication/auth.service.js");
const db = require("../database.js");

const postNewUser = async (req, res) => {
  const { userData, plainTextPassword } = await parseAndValidateUser(req);

  const { passwordHash, passwordMetadata } =
    await auth.createPasswordHash(plainTextPassword);
  const newUser = { ...userData, passwordHash, passwordMetadata };

  const newUserId = await db.addNewUser(newUser);
  res.status(201).json({ id: newUserId });
};

const login = async (req, res) => {
  const { userData, plainTextPassword } = await parseAndValidateUser(req);
  const token = await auth.login(userData.email, plainTextPassword);
  res.status(200).json({ token });
};

const getUserById = async (req, res) => {
  const userData = await db.findUserById(req.params["id"]);
  res.status(200).json(userData);
};

module.exports = { postNewUser, login, getUserById };
