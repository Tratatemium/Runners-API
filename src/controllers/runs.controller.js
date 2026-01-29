const { parseAndValidateRun } = require("../middleware/validation/runs.validation.js");
const { validateUUID } = require("../middleware/validation/validators.js");
const runsRepo = require("../repositories/users.repository.js");

const getRunById = async (req, res) => {
  validateUUID(req.params.id, "runId");
  const data = await runsRepo.findRunById(req.params.id);
  if (!data) {
    const err = new Error(`No run with ID ${req.params.id} found!`);
    err.status = 404;
    throw err;
  }
  res.json(data);
};

const postNewRun = async (req, res) => {
  const newRun = parseAndValidateRun(req);
  const newRunId = await runsRepo.addNewRun(newRun);
  res.status(201).json({ id: newRunId });
};

module.exports = { getRunById, postNewRun };
