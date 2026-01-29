const Run = require("../models/runs.models.js");
const { randomUUID } = require("crypto");

const findRunById = async (runId) => {
  const selectedRun = await Run.findOne({
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