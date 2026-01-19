const express = require("express");
const router = express.Router();

const { validateRunFields } = require("../validation/validation.js");
const { addNewRun } = require("../database.js");

/* ================================================================================================= */
/*  POST NEW RUN                                                                                     */
/* ================================================================================================= */

const parseAndValidateRun = (req) => {
  if (!req.is("json")) {
    const err = new Error("Content-Type must be json.");
    err.status = 415;
    throw err;
  }
  const { userId, startTime, durationSec, distanceMeters } = req.body;
  const newRun = validateRunFields({
    userId,
    startTime,
    durationSec,
    distanceMeters,
  });
  return newRun;
};

router.post("/new-run", async (req, res) => {
  const newRun = parseAndValidateRun(req);
  const newRunID = await addNewRun(newRun);
  res.status(201).send(`New run ID: ${newRunID}`);
});

module.exports = router;
