const express = require("express");
const router = express.Router();

const validation = require("../middleware/validation/users.validation.js");
const authentication = require("../middleware/auth.middleware.js");
// const guard = require("../middleware/guard.middleware.js");
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

router.get(
  "/me",
  authentication.checkAuth,
  usersMiddleware.attachUser,
  // NOTE: possibly add guard middleware to check if user is active / banned / etc.
  usersController.getMe,
);

module.exports = router;

// TODO: PATCH users/me


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


// TODO: this functionality is moved to GET users/me, this should be refactored into admin route
// router.get(
//   "/:id",
//   validation.validateUUID("id"),
//   authentication.checkAuth,
//   guard.checkOwnership("id"),
//   usersController.getUserById,
// );


