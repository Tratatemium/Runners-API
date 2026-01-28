const express = require("express");
const router = express.Router();

const validation = require("../middleware/validation/users.validation.js");
const authentication = require("../middleware/authentication/auth.middleware.js");
const guard = require("../middleware/authentication/guard.middleware.js");
const usersMiddleware = require("../middleware/users.middleware.js");
const usersController = require("../controllers/users.controller.js");

router.post(
  "/signup",
  validation.validateRegisterRequest,
  usersController.createUser,
);

router.post("/login", validation.validateLoginRequest, usersController.login);

router.get(
  "/me",
  authentication.checkAuth,
  usersMiddleware.attachUser,
  // NOTE: possibly add guard middleware to check if user is active / banned / etc.
  usersController.getMe,
);

// TODO: this functionality is moved to GET users/me, this should be refactored into admin route
// router.get(
//   "/:id",
//   validation.validateUUID("id"),
//   authentication.checkAuth,
//   guard.checkOwnership("id"),
//   usersController.getUserById,
// );

module.exports = router;
