const express = require("express");
const router = express.Router();

const runsValidation = require("../middleware/validation/runs.validation.js");
const authMiddleware = require("../middleware/auth.middleware.js");
const guardMiddleware = require("../middleware/guard.middleware.js");
const runsController = require("../controllers/runs.controller.js");

router.get(
  "/:id",
  runsValidation.validateUUID("id"),
  runsController.getRunById,
);

router.delete(
  "/:id",
  runsValidation.validateUUID("id"),
  authMiddleware.checkAuth,
  guardMiddleware.checkPermissions({ param: "id", type: "runId" }),
  runsController.deleteRunById,
);

module.exports = router;
