const validators = require("./validators.js");

const parseAndValidateRun = (req) => {
  validators.validateJsonContentType(req);

  validators.assertRequestFields(
    req,
    ["userId", "startTime", "durationSec", "distanceMeters"],
    "Run data",
  );

  const { userId, startTime, durationSec, distanceMeters } = req.body;

  validators.assertString(userId, "userID");
  validators.assertString(startTime, "startTime");

  const userIdTrimmed = userId.trim();
  const startTimeTrimmed = startTime.trim();

  validators.validateUUID(userIdTrimmed, "userId");
  validators.validateISODate(startTimeTrimmed, "startTime");

  const durationNormalized = Number(String(durationSec).trim());
  const distanceNormalized = Number(String(distanceMeters).trim());

  validators.validatePositiveNumber(durationNormalized, "durationSec");
  validators.validatePositiveNumber(distanceNormalized, "distanceMeters");

  const runData = {
    userId: userIdTrimmed,
    startTime: startTimeTrimmed,
    durationSec: durationNormalized,
    distanceMeters: distanceNormalized,
  };

  return runData;
};

module.exports = { parseAndValidateRun };
