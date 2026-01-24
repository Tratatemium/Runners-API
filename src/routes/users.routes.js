const express = require("express");
const router = express.Router();

const usersController = require("../controllers/users.controller.js");

router.post("/", usersController.postNewUser);
router.post("/login", usersController.login);

module.exports = router;
