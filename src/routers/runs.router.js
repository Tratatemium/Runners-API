const express = require("express");
const runsRouter = express.Router();

const runsValidation = require("../middleware/validation/runs.validation.js");
const authMiddleware = require("../middleware/auth.middleware.js");
const guardMiddleware = require("../middleware/guard.middleware.js");
const runsController = require("../controllers/runs.controller.js");

runsRouter.get(
  "/:id",
  runsValidation.validateUUID("id"),
  runsController.getRunById,
);

runsRouter.delete(
  "/:id",
  runsValidation.validateUUID("id"),
  authMiddleware.checkAuth,
  guardMiddleware.checkPermissions({
    mode: "ether",
    param: "id",
    type: "runId",
  }),
  runsController.deleteRunById,
);

module.exports = runsRouter;
