/* ================================================================================================= */
/*  HELPER FUNCTIONS                                                                                 */
/* ================================================================================================= */

const validateUUID = (ID, IDname = "ID") => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const isUUID = uuidRegex.test(ID);
  if (!isUUID) {
    const err = new Error(`${IDname} must be a valid UUID.`);
    err.status = 400;
    throw err;
  }
};

const isCorrectISODate = (str) => {
  const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

  if (!isoRegex.test(str)) return false;

  const date = new Date(str);
  return !isNaN(date.getTime());
};

const validateJsonContentType = (req) => {
  if (!req.is("json")) {
    const err = new Error("Content-Type must be json.");
    err.status = 415;
    throw err;
  }
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

  validateUUID(userId, "userId");

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

const parseAndValidateRun = (req) => {
  validateJsonContentType(req);

  const { userId, startTime, durationSec, distanceMeters } = req.body;
  const runData = validateRunFields({
    userId,
    startTime,
    durationSec,
    distanceMeters,
  });
  return runData;
};

/* ================================================================================================= */
/*  USER DATA VALIDATION                                                                             */
/* ================================================================================================= */

const validateUserFields = ({
  username,
  password,
  email,
  firstName,
  lastName,
  dateOfBirth,
  heightCm,
  weightKg,
}) => {
  // To be implemented

  const validated = {
    username,
    email,
    profile: {
      firstName,
      lastName,
      dateOfBirth,
      heightCm,
      weightKg,
    }
  };

  return { userData: validated, plainTextPassword: password };
};

const parseAndValidateUser = (req) => {
  validateJsonContentType(req);

  const { username, password, email, profile } = req.body;
  const { firstName, lastName, dateOfBirth, heightCm, weightKg } = profile;

  const { userData, plainTextPassword } = validateUserFields({
    username,
    password,
    email,
    firstName,
    lastName,
    dateOfBirth,
    heightCm,
    weightKg,
  });
  return { userData, plainTextPassword };
};

/* ================================================================================================= */
/*  EXPORTS                                                                                          */
/* ================================================================================================= */

module.exports = {
  validateUUID,
  isCorrectISODate,
  parseAndValidateRun,
  parseAndValidateUser,
};
