const express = require("express");
const router = express.Router();

const usersController = require("../controllers/users.controller.js");
const authentication = require("../middleware/auth.middleware.js");
const validation = require("../middleware/validation/users.validation.js");

router.post(
  "/",
  validation.validateRegisterRequest,
  usersController.postNewUser,
);

router.post("/login", usersController.login);

router.get(
  "/:id",
  authentication.checkAuth,
  authentication.checkOwnership("id"),
  usersController.getUserById,
);

module.exports = router;
