const runsRepo = require("../repositories/runs.repository.js");

const throwRunNotFoundError = (runId) => {
  const err = new Error(`No run with ID ${runId} found!`);
  err.status = 404;
  throw err;
};

const createRun = async (newRun) => {
  return await runsRepo.addNewRun(newRun);
};

const getRunsByUser = async (userId) => {
  const runs = await runsRepo.findRunsByUserId(userId);
  return runs;
};

const getRunById = async (runId) => {
  const runData = await runsRepo.findRunById(runId);
  if (!runData) throwRunNotFoundError(runId);
  return runData;
};

const updateRunById = async (runId, runUpdate) => {
  const runData = await runsRepo.updateRunById(runId, runUpdate);
  if (!runData) throwRunNotFoundError(runId);
  return runData;
};

const deleteRunById = async (runId) => {
  const result = await runsRepo.deleteRunById(runId);
  if (result.deletedCount === 0) throwRunNotFoundError(runId);
};

module.exports = {
  createRun,
  getRunById,
  getRunsByUser,
  updateRunById,
  deleteRunById,
};
