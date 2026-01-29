const { RunCommandCursor } = require("mongodb");
const Run = require("../models/Run");

const findRunById = async (runId) => {
  const selectedRun = await RunCommandCursor.findOne({
    runId: runId,
  });
  return selectedRun || null;
};

const addNewRun = async (newRun) => {
  const newRunId = randomUUID();
  const runToInsert = { runId: newRunId, ...newRun };
  const savedRun = await Run.create(runToInsert);
  console.log("New run added to the database. ID:", newRunId);
  return savedRun.runId;
};

module.exports = {
  findRunById,
  addNewRun,
};