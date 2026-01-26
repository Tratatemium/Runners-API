const { parseAndValidateUser } = require("../validation/users.validation.js");
const auth = require("../authentication/auth.service.js");
const db = require("../database.js");

const postNewUser = async (req, res) => {
  const { email, username, plainTextPassword } =
    await parseAndValidateUser(req);

  const { passwordHash, passwordMetadata } =
    await auth.createPasswordHash(plainTextPassword);
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
  const { email, plainTextPassword } = await parseAndValidateUser(req);
  const token = await auth.login(email, plainTextPassword);
  res.status(200).json({ token });
};

const getUserById = async (req, res) => {
  // TODO Add validateUUID(req.params.id, "userId") before querying the database, following the same pattern as the runs controller.
  const userData = await db.findUserById(req.params["id"]);
  // TODO This should check for null and return a 404 error instead, similar to the pattern used in src/controllers/runs.controller.js lines 8-12.
  const { _id, credentials, ...safeData } = userData;
  res.status(200).json(safeData);
};

module.exports = { postNewUser, login, getUserById };
