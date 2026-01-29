const findRunById = async (runId) => {
  const runs = getCollection("runs");

  const selectedRun = await runs.findOne({
    runId: runId,
  });
  return selectedRun || null;
};

const addNewRun = async (newRun) => {
  const runs = getCollection("runs");

  const newRunId = randomUUID();
  const runToInsert = { runId: newRunId, ...newRun };

  const result = await runs.insertOne(runToInsert);
  if (!result.acknowledged) {
    const err = new Error("Failed to save new run.");
    err.status = 500;
    throw err;
  }
  console.log("New run added to the database. ID:", newRunId);
  return newRunId;
};

module.exports = {
  findRunById,
  addNewRun,
};