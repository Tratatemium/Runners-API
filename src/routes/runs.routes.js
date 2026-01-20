const express = require("express");
const router = express.Router();

const {
  validateUUID,
  parseAndValidateRun,
} = require("../validation/validation.js");
const { getRunByID, addNewRun } = require("../database.js");

/* GET RUN BY runID */
router.get("/:id", async (req, res) => {
  validateUUID(req.params.id, "runID");
  const data = await getRunByID(req.params.id);
  res.json(data);
});

/*  POST NEW RUN */
router.post("/new-run", async (req, res) => {
  const newRun = parseAndValidateRun(req);
  const newRunID = await addNewRun(newRun);
  res.status(201).json({ id: newRunID });
});

module.exports = router;
