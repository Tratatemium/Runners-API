const express = require("express");
const authRouter = express.Router();

const validation = require("../middleware/validation/auth.validation.js");
const authMiddleware = require("../middleware/auth.middleware.js");
const authController = require("../controllers/auth.controller.js");

authRouter.post(
  "/signup",
  validation.validateRegisterRequest,
  authController.createUser,
);

authRouter.post(
  "/login",
  validation.validateLoginRequest,
  authController.loginUser,
);

authRouter.post(
  "/logoutAll",
  authMiddleware.checkAuth,
  authController.logoutAll,
);

module.exports = authRouter;

// IDEA: POST /auth/password-reset
// {
//   "email": "user@example.com"
// }

// IDEA: POST /auth/password-reset/confirm
// {
//   "token": "reset_token",
//   "newPassword": "new_password"
// }
