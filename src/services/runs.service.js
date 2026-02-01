const runsRepo = require("../repositories/runs.repository.js");

const createRun = async (newRun) => {
  return await runsRepo.addNewRun(newRun);
};

const getRunById = async (runId) => {
  const runData = await runsRepo.findRunById(runId);
  if (!runData) {
    const err = new Error(`No run with ID ${runId} found!`);
    err.status = 404;
    throw err;
  }
  return runData;
};

module.exports = { createRun, getRunById };
