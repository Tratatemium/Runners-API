const runsService = require("../services/runs.service.js");
const { sendSuccess } = require("../utils/response.utils.js");

const postNewRun = async (req, res) => {
  const userId = req.user.userId;
  const newRun = { userId, ...req.runData };
  const newRunId = await runsService.createRun(newRun);
  sendSuccess(res, 201, { runId: newRunId });
};

const getMyRuns = async (req, res) => {
  const userId = req.user.userId;
  const myRuns = await runsService.getRunsByUser(userId);
  sendSuccess(res, 200, myRuns, { results: myRuns.length });
};

const getRunById = async (req, res) => {
  const runData = await runsService.getRunById(req.params.id);
  sendSuccess(res, 200, runData);
};

const deleteRunById = async (req, res) => {
  await runsService.deleteRunById(req.params.id);
  res.sendStatus(204);
};

module.exports = { postNewRun, getMyRuns, getRunById, deleteRunById };
