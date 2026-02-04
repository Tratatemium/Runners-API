const express = require("express");
const router = express.Router();

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

router.get("/me", authMiddleware.checkAuth, usersController.getMe);

router.patch(
  "/me/profile",
  usersValidation.validateProfileUpdate,
  authMiddleware.checkAuth,
  usersController.updateProfile,
);

router.patch(
  "/me/account",
  usersValidation.validateAccountUpdate,
  authMiddleware.checkAuth,
  usersController.updateAccount,
);

/* ================================================================================================= */
/*  My runs                                                                                          */
/* ================================================================================================= */

router.post(
  "/me/runs",
  runsValidation.validateRun,
  authMiddleware.checkAuth,
  runsController.postNewRun,
);

router.get("/me/runs", authMiddleware.checkAuth, runsController.getMyRuns);

/* ================================================================================================= */
/*  Admin                                                                                            */
/* ================================================================================================= */

router.get(
  "/:id",
  usersValidation.validateUUID("id"),
  authMiddleware.checkAuth,
  guardMiddleware.checkPermissions({ param: "id", type: "userId" }),
  usersController.getUserById,
);

module.exports = router;
