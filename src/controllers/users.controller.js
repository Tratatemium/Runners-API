const { parseAndValidateUser } = require("../validation/users.validation.js");
const { createPasswordHash } = require("../authentication/hashing.js");
const { addNewUser } = require("../database.js");

const postNewUser = async (req, res) => {
  const { userData, plainTextPassword } = await parseAndValidateUser(req);
  const { passwordHash, passwordMetadata } =
    await createPasswordHash(plainTextPassword);
  const newUser = { ...userData, passwordHash, passwordMetadata };
  const newUserID = await addNewUser(newUser);
  res.status(201).json({ id: newUserID });
};

module.exports = { postNewUser };
