/* ================================================================================================= */
/*  HELPER FUNCTIONS                                                                                 */
/* ================================================================================================= */

const throwValidationError = (message, status = 400) => {
  const err = new Error(message);
  err.status = status;
  throw err;
};

/* ================================================================================================= */
/*  VALIDATE FUNCTIONS                                                                               */
/* ================================================================================================= */

const validateJsonContentType = (req) => {
  if (!req.is("json")) {
    throwValidationError("Content-Type must be json.", 415);
  }
};

const assertRequestFields = (
  req,
  requiredFields,
  objectName = "Request body",
) => {
  if (typeof req.body !== "object" || req.body === null) {
    throwValidationError(`${objectName} must be an object`);
  }
  const missingFields = requiredFields.filter(
    (field) => req.body[field] === undefined || req.body[field] === null,
  );
  if (missingFields.length > 0) {
    const missingFieldsString = missingFields.join(", ");
    throwValidationError(
      `${objectName} is missing required fields: ${missingFieldsString}.`,
    );
  }
};

const assertString = (str, strName) => {
  if (typeof str !== "string") {
    throwValidationError(`${strName} must be a string.`);
  }
};

const validateUUID = (ID, IDname = "ID") => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const isUUID = uuidRegex.test(ID);
  if (!isUUID) {
    throwValidationError(`${IDname} must be a valid UUID.`);
  }
};

const validateISODate = (timestamp, timestampName) => {
  const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/;
  if (!isoRegex.test(timestamp)) {
    throwValidationError(
      `${timestampName} must be a valid date in the ISO 8601 format.`,
    );
  }
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) {
    throwValidationError(
      `${timestampName} must be a valid date in the ISO 8601 format.`,
    );
  }
};

const validatePositiveNumber = (number, numberName) => {
  if (isNaN(number) || number <= 0) {
    throwValidationError(`${numberName} must be a positive number.`);
  }
};

const validateUsername = (username) => {
  if (typeof username !== "string") {
    throwValidationError("Username must be a string.");
  }
  if (username.length < 6 || username.length > 30) {
    throwValidationError("Username must be between 6 and 30 characters long.");
  }
  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  if (!usernameRegex.test(username)) {
    throwValidationError(
      "Username may only contain letters, numbers, and underscores.",
    );
  }
};

const validateEmail = (email) => {
  if (typeof email !== "string") {
    throwValidationError("Email must be a string.");
  }
  if (email.length > 254) {
    throwValidationError("Email is too long.");
  }
  if (/\s/.test(email)) {
    throwValidationError("Email must not contain whitespace.");
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throwValidationError("Email must be a valid email address.");
  }
};

const validatePassword = (password) => {
  if (typeof password !== "string") {
    throwValidationError("Password must be a string.");
  }
  const length = password.length;
  if (length < 12) {
    throwValidationError("Password must be at least 12 characters long.");
  }
  if (length > 128) {
    throwValidationError("Password must be at most 128 characters long.");
  }
};

/* ================================================================================================= */
/*  EXPORTS                                                                                          */
/* ================================================================================================= */

module.exports = {
  validateJsonContentType,
  assertRequestFields,
  assertString,
  validateUUID,
  validateISODate,
  validatePositiveNumber,
  validateUsername,
  validateEmail,
  validatePassword,
};
