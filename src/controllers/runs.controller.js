const { parseAndValidateRun } = require("../validation/runs.validation.js");
const { validateUUID } = require("../validation/validators.js");
const { findRunByID, addNewRun } = require("../database.js");

const getRunByID = async (req, res) => {
  validateUUID(req.params.id, "runID");
  const data = await findRunByID(req.params.id);
  if (!data) {
    const err = new Error(`No run with ID ${req.params.id} found!`);
    err.status = 404;
    throw err;
  }
  res.json(data);
};

const postNewRun = async (req, res) => {
  const newRun = parseAndValidateRun(req);
  const newRunID = await addNewRun(newRun);
  res.status(201).json({ id: newRunID });
};

module.exports = { getRunByID, postNewRun };
