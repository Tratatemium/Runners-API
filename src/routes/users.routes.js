const express = require("express");
const router = express.Router();

const usersController = require("../controllers/users.controller.js");

router.post("/", usersController.postNewUser);

module.exports = router;



