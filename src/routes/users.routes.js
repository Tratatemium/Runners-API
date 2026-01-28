const express = require("express");
const router = express.Router();

const usersController = require("../controllers/users.controller.js");
const authentication = require("../middleware/authentication/auth.middleware.js");
const usersMiddleware = require("../middleware/users.middleware.js");
const validation = require("../middleware/validation/users.validation.js");

router.post(
  "/signup",
  validation.validateRegisterRequest,
  usersController.createUser,
);

router.post("/login", validation.validateLoginRequest, usersController.login);

// NOTE: possibly add guard middleware to check if user is active / banned / etc.
router.get(
  "/users/me",
  authentication.checkAuth,
  usersMiddleware.attachUser,
  usersController.getMe,
);

// TODO: this functionality is moved to GET users/me, this should be refactored into admin route
router.get(
  "/:id",
  authentication.checkAuth,
  validation.validateUUID("id"),
  guard.checkOwnership("id"),
  usersController.getUserById,
);

module.exports = router;
