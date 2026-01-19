const express = require("express");
const router = express.Router();

const { parseAndValidateRun } = require("../validation/validation.js");
const { addNewRun } = require("../database.js");

/* ================================================================================================= */
/*  POST NEW RUN                                                                                     */
/* ================================================================================================= */

router.post("/new-run", async (req, res) => {
  const newRun = parseAndValidateRun(req);
  const newRunID = await addNewRun(newRun);
  res.status(201).send(`New run ID: ${newRunID}`);
});

module.exports = router;
