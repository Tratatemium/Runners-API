const express = require("express");
const router = express.Router();

const validation = require("../middleware/validation/users.validation.js");
const authentication = require("../middleware/auth.middleware.js");
const usersMiddleware = require("../middleware/users.middleware.js");
const usersController = require("../controllers/users.controller.js");

// NOTE: possibly add guard middleware to check if user is active / banned / etc.

router.get(
  "/me",
  authentication.checkAuth,
  usersMiddleware.attachUser,
  usersController.getMe,
);

router.patch(
  "/me/profile",
  validation.validateProfile,
  authentication.checkAuth,
  usersController.updateProfile,
);

router.patch(
  "/me/password",
  validation.validateAccountUpdate("password"),
  authentication.checkAuth,
  usersController.updateAccount("password"),
);

router.patch(
  "/me/email",
  validation.validateAccountUpdate("email"),
  authentication.checkAuth,
  usersController.updateAccount("email"),
);

router.patch(
  "/me/username",
  validation.validateAccountUpdate("username"),
  authentication.checkAuth,
  usersController.updateAccount("username"),
);

module.exports = router;

// IDEA: POST /users/password-reset
// {
//   "email": "user@example.com"
// }

// IDEA: POST /users/password-reset/confirm
// {
//   "token": "reset_token",
//   "newPassword": "new_password"
// }
