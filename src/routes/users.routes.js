const express = require("express");
const router = express.Router();

const validation = require("../middleware/validation/users.validation.js");
const authMiddleware = require("../middleware/auth.middleware.js");
const usersController = require("../controllers/users.controller.js");

// NOTE: possibly add guard middleware to check if user is active / banned / etc.

router.get("/me", authMiddleware.checkAuth, usersController.getMe);

router.patch(
  "/me/profile",
  validation.validateProfileUpdate,
  authMiddleware.checkAuth,
  usersController.updateProfile,
);

router.patch(
  "/me/account",
  validation.validateAccountUpdate,
  authMiddleware.checkAuth,
  usersController.updateAccount,
);

module.exports = router;
