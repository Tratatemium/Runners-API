const express = require("express");
const router = express.Router();

const usersController = require("../controllers/users.controller.js");
const { authMiddleware } = require("../middleware/auth.middleware.js");

router.post("/", usersController.postNewUser);
router.post("/login", usersController.login);

router.get("/:id", authMiddleware, usersController.getUserById);

module.exports = router;
