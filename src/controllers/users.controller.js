const auth = require("../authentication/auth.service.js");
const db = require("../database.js");

const createUser = async (req, res) => {
  const { email, username, password } = req.body;

  const { passwordHash, passwordMetadata } =
    await auth.createPasswordHash(password);
  const newUser = {
    credentials: { passwordHash, passwordMetadata },
    account: {
      username,
      email,
      createdAt: new Date().toISOString(),
      lastLogin: null,
    },
    profile: {},
  };

  const newUserId = await db.addNewUser(newUser);
  res.status(201).json({ id: newUserId });
};

const login = async (req, res) => {
  const { email, username, password } = req.body;
  const token = await auth.login(email, password);
  res.status(200).json({ token });
};

const getUserById = async (req, res) => {
  // TODO Add validateUUID(req.params.id, "userId") before querying the database, following the same pattern as the runs controller.
  const userData = await db.findUserById(req.params["id"]);
  // TODO This should check for null and return a 404 error instead, similar to the pattern used in src/controllers/runs.controller.js lines 8-12.
  const { _id, credentials, ...safeData } = userData;
  res.status(200).json(safeData);
};

module.exports = { createUser, login, getUserById };
