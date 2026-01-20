const express = require("express");
const router = express.Router();

const { parseAndValidateUser } = require("../validation/validation.js");
const { createPasswordHash } = require("../authentication/hashing.js");
const { addNewUser } = require("../database.js");

router.post("/new-user", async (req, res) => {
  const { userData, plainTextPassword } = parseAndValidateUser(req);
  const { passwordHash, passwordMetadata } =
    await createPasswordHash(plainTextPassword);
  const newUser = { ...userData, passwordHash, passwordMetadata };
  const newUserID = await addNewUser(newUser);
  res.status(201).json({ id: newUserID });
});

module.exports = router;
