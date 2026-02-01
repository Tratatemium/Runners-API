const { validateUUID } = require("../middleware/validation/validators.js");
const runsRepo = require("../repositories/runs.repository.js");


const postNewRun = async (req, res) => {
  const userId = req.user.userId;
  const newRun = { userId, ... req.runData }
  const newRunId = await runsRepo.addNewRun(newRun);
  res.status(201).json({ id: newRunId });
};

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

module.exports = { getRunById, postNewRun };
