const express = require("express");
const router = express.Router();

const usersController = require("../controllers/users.controller.js");
const authentication = require("../middleware/auth.middleware.js");
const validation = require("../middleware/validation/users.validation.js");

router.post(
  "/",
  validation.validateRegisterRequest,
  usersController.createUser,
);

router.post("/login", validation.validateLoginRequest, usersController.login);

router.get(
  "/:id",
  authentication.checkAuth,
  validation.validateUUID("id"),
  authentication.checkOwnership("id"),
  usersController.getUserById,
);

module.exports = router;
