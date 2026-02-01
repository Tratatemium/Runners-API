const runsService = require("../services/runs.service.js");

const postNewRun = async (req, res) => {
  const userId = req.user.userId;
  const newRun = { userId, ...req.runData };
  const newRunId = await runsService.createRun(newRun);
  res.status(201).json({ id: newRunId });
};

const getRunById = async (req, res) => {
  const runData = await runsService.getRunById(req.params.id);
  res.status(200).json(runData);
};

module.exports = { getRunById, postNewRun };
