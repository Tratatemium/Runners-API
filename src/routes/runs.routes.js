const express = require("express");
const router = express.Router();

const validation = require("../middleware/validation/runs.validation.js");
const authMiddleware = require("../middleware/auth.middleware.js");
const runsController = require("../controllers/runs.controller.js");

router.post(
  "/",
  validation.validateRun,
  authMiddleware.checkAuth,
  runsController.postNewRun,
);

router.get("/:id", runsController.getRunById);

module.exports = router;
