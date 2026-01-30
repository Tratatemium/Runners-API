const express = require("express");
const router = express.Router();

const validation = require("../middleware/validation/users.validation.js");
const authentication = require("../middleware/auth.middleware.js");
const usersMiddleware = require("../middleware/users.middleware.js");
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

// NOTE: possibly add guard middleware to check if user is active / banned / etc.

router.get(
  "/me",
  authentication.checkAuth,
  usersMiddleware.attachUser,
  usersController.getMe,
);

router.patch(
  "/me",
  validation.validateProfile,
  authentication.checkAuth,
  usersController.updateProfile,
);

module.exports = router;

// TODO: PATCH users/me/password
// {
//   "currentPassword": "old_password",
//   "newPassword": "new_password"
// }

// TODO: PATCH users/me/email
// {
//   "currentPassword": "old_password",
//   "newEmail": "new@example.com"
// }

// IDEA: POST /users/password-reset
// {
//   "email": "user@example.com"
// }

// IDEA: POST /users/password-reset/confirm
// {
//   "token": "reset_token",
//   "newPassword": "new_password"
// }
