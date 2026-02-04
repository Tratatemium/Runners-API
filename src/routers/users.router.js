const express = require("express");
const usersRouter = express.Router();

const usersValidation = require("../middleware/validation/users.validation.js");
const runsValidation = require("../middleware/validation/runs.validation.js");
const authMiddleware = require("../middleware/auth.middleware.js");
const guardMiddleware = require("../middleware/guard.middleware.js");
const usersController = require("../controllers/users.controller.js");
const runsController = require("../controllers/runs.controller.js");

// NOTE: possibly add guard middleware to check if user is active / banned / etc.

/* ================================================================================================= */
/*  User (me)                                                                                        */
/* ================================================================================================= */

usersRouter.get("/me", authMiddleware.checkAuth, usersController.getMe);

usersRouter.patch(
  "/me/profile",
  usersValidation.validateProfileUpdate,
  authMiddleware.checkAuth,
  usersController.updateProfile,
);

usersRouter.patch(
  "/me/account",
  usersValidation.validateAccountUpdate,
  authMiddleware.checkAuth,
  usersController.updateAccount,
);

/* ================================================================================================= */
/*  My runs                                                                                          */
/* ================================================================================================= */

usersRouter.post(
  "/me/runs",
  runsValidation.validateRun,
  authMiddleware.checkAuth,
  runsController.postNewRun,
);

usersRouter.get("/me/runs", authMiddleware.checkAuth, runsController.getMyRuns);

/* ================================================================================================= */
/*  Admin                                                                                            */
/* ================================================================================================= */

usersRouter.get(
  "/",
  authMiddleware.checkAuth,
  guardMiddleware.checkPermissions({ mode: "admin" }),
  usersController.getAllUsers,
);

usersRouter.get(
  "/:id",
  usersValidation.validateUUID("id"),
  authMiddleware.checkAuth,
  guardMiddleware.checkPermissions({
    mode: "either",
    param: "id",
    type: "userId",
  }),
  usersController.getUserById,
);

/* ================================================================================================= */
/*  EXPORTS                                                                                          */
/* ================================================================================================= */

module.exports = usersRouter;
