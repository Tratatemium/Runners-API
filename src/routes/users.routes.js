const express = require("express");
const router = express.Router();

const { parseAndValidateUser } = require("../validation/validation.js");
const { createPasswordHash } = require("../authentication/hashing.js");
const { addNewUser } = require("../database.js");

router.post("/new-user", async (req, res) => {
  const { userData, plainTextPassword } = parseAndValidateUser(req);
  const passwordHash = await createPasswordHash(plainTextPassword);
  const newUser = { ...userData, password: passwordHash };
  const newUserID = await addNewUser(newUser);
  res.status(201).send(`New user ID: ${newUserID}`);
});

module.exports = router;

// {
//   "username": "fastfeet",
//   "password": "StrongPassword!123",
//   "email": "runner@example.com",
//   "profile": {
//     "firstName": "Alex",
//     "lastName": "Miller",
//     "dateOfBirth": "1995-06-18",
//     "heightCm": 178,
//     "weightKg": 72
//   }
// }
