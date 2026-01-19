/* ================================================================================================= */
/*  HELPER FUNCTIONS                                                                                 */
/* ================================================================================================= */

const isUUID = (str) => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

const isCorrectISODate = (str) => {
  const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

  if (!isoRegex.test(str)) return false;

  const date = new Date(str);
  return !isNaN(date.getTime());
};

/* ================================================================================================= */
/*  RUN DATA VALIDATION                                                                              */
/* ================================================================================================= */

const validateRunFields = ({
  userId,
  startTime,
  durationSec,
  distanceMeters,
}) => {
  if (!userId || !startTime || durationSec == null || distanceMeters == null) {
    const err = new Error(
      "The request body must include all required fields: userId, startTime, durationSec, distanceMeters."
    );
    err.status = 400;
    throw err;
  }

  if (!isUUID(userId)) {
    const err = new Error("userId must be a valid UUID.");
    err.status = 400;
    throw err;
  }

  if (!isCorrectISODate(startTime)) {
    const err = new Error(
      "startTime must be a valid date in the ISO 8601 format."
    );
    err.status = 400;
    throw err;
  }

  const durationNormalized = Number(durationSec);
  const distanceNormalized = Number(distanceMeters);

  if (isNaN(durationNormalized) || durationNormalized <= 0) {
    const err = new Error("durationSec must be a positive number.");
    err.status = 400;
    throw err;
  }

  if (isNaN(distanceNormalized) || distanceNormalized <= 0) {
    const err = new Error("distanceMeters must be a positive number.");
    err.status = 400;
    throw err;
  }

  return {
    userId,
    startTime,
    durationSec: durationNormalized,
    distanceMeters: distanceNormalized,
  };
};

module.exports = { isUUID, isCorrectISODate, validateRunFields };
