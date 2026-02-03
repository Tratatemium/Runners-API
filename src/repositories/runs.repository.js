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

const findRunsByUserId = async (userId) => {
    return await Run.find({ userId: userId })
    .sort({ startTime: -1, runId: 1 })  // most recent first
    .lean();
};

module.exports = {
  findRunById,
  addNewRun,
  findRunsByUserId,
};
