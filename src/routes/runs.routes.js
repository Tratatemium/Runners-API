// runs.routes.js

const express = require("express");
const router = express.Router();

const runsController = require("../controllers/runs.controller.js");

router.get("/:id", runsController.getRunByID);
router.post("/", runsController.postNewRun);

module.exports = router;
