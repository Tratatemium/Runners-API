const runsService = require("../services/runs.service.js");

const throwGuardError = (
  message = "You are not allowed to perform this action.",
  status = 403,
) => {
  const err = new Error(message);
  err.status = status;
  throw err;
};

const checkPremissions = (param = "id", idType) => {
  return async (req, res, next) => {
    const providedId = req.user.userId;

    let resourceId;
    switch (idType) {
      case "userId":
        resourceId = req.params[param];
        break;

      case "runId":
        const run = await runsService.getRunById(req.params[param]);
        resourceId = run.userId;
        break;

      default:
        throw new Error('idType must be "userId" or "runId".');
    }

    const isOwner = providedId === resourceId;
    if (!isOwner) throwGuardError();

    next();
  };
};

module.exports = { checkPremissions };
