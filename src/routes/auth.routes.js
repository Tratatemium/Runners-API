const express = require("express");
const router = express.Router();

const validation = require("../middleware/validation/users.validation.js");
const authentication = require("../middleware/auth.middleware.js");
const usersController = require("../controllers/users.controller.js");

router.post(
  "/signup",
  validation.validateRegisterRequest,
  usersController.createUser,
);

router.post(
  "/login",
  validation.validateLoginRequest,
  usersController.loginUser,
);

router.post("/logout-all", authentication.checkAuth, usersController.logoutAll);

module.exports = router;
