const validators = require("./validators.js");

const validateRun = (req, res, next) => {
  validators.validateJsonContentType(req);

  validators.assertRequestFields(
    req,
    ["startTime", "durationSec", "distanceMeters"],
    "Run data",
  );

  const { startTime, durationSec, distanceMeters } = req.body;

  validators.assertString(startTime, "startTime");
  const startTimeTrimmed = startTime.trim();
  validators.validateISODateTimeUTC(startTimeTrimmed, "startTime");

  const durationNormalized = Number(String(durationSec).trim());
  validators.validatePositiveNumber(durationNormalized, "durationSec");

  const distanceNormalized = Number(String(distanceMeters).trim());
  validators.validatePositiveNumber(distanceNormalized, "distanceMeters");

  const runData = {
    startTime: startTimeTrimmed,
    durationSec: durationNormalized,
    distanceMeters: distanceNormalized,
  };

  req.runData = runData;
  next();
};

module.exports = { validateRun };
