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
  const runId = req.params.id;
  const runData = await runsService.getRunById(runId);
  sendSuccess(res, 200, runData);
};

const updateRunById = async (req, res) => {
  const runId = req.params.id;
  const runUpdate = req.body;
  const runData = await runsService.updateRunById(runId, runUpdate);
  sendSuccess(res, 200, runData);
};

const deleteRunById = async (req, res) => {
  const runId = req.params.id;
  await runsService.deleteRunById(runId);
  res.sendStatus(204);
};

module.exports = {
  postNewRun,
  getMyRuns,
  getRunById,
  updateRunById,
  deleteRunById,
};
