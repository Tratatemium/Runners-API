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

const assertRequestFields = ({
  object,
  objectName = "Request body",
  requiredFields,
  mode = "require_all",
}) => {
  if (!["require_all", "require_some"].includes(mode)) {
    throw new Error(`Invalid validation mode: ${mode}`);
  }
  if (!Array.isArray(requiredFields) || requiredFields.length === 0) {
    throw new Error("requiredFields must be a non-empty array");
  }
  if (typeof object !== "object" || object == null) {
    throwValidationError(`${objectName} must be an object`);
  }

  for (const key of Object.keys(object)) {
    if (!requiredFields.includes(key)) {
      throwValidationError(`Unknown field: ${key}`);
    }
  }

  const hasValue = (field) => object[field] != null;

  if (mode === "require_all") {
    const missingFields = requiredFields.filter((field) => !hasValue(field));
    if (missingFields.length > 0) {
      throwValidationError(
        `${objectName} is missing required fields: ${missingFields.join(", ")}.`,
      );
    }
    return;
  }

  if (mode === "require_some") {
    const hasAtLeastOneField = requiredFields.some((field) => hasValue(field));
    if (!hasAtLeastOneField) {
      throwValidationError(
        `${objectName} must have one of the required fields: ${requiredFields.join(", ")}.`,
      );
    }
    return;
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

/**
 * Validate ISO date or datetime.
 * @param {string} value - The input string to validate
 * @param {string} name - Field name for error messages
 * @param {'date'|'datetime'} mode - 'date' for YYYY-MM-DD, 'datetime' for YYYY-MM-DDTHH:mm:ssZ
 */
const validateISO = (value, name, mode = "datetime") => {
  if (typeof value !== "string") {
    throwValidationError(`${name} must be a string.`);
  }

  // -------------------
  // DATE-ONLY MODE
  // -------------------
  if (mode === "date") {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(value)) {
      throwValidationError(
        `${name} must be a valid ISO 8601 date (YYYY-MM-DD).`,
      );
    }

    const date = new Date(`${value}T00:00:00Z`);
    if (!Number.isFinite(date.getTime())) {
      throwValidationError(`${name} must be a valid calendar date.`);
    }

    if (date.toISOString().slice(0, 10) !== value) {
      throwValidationError(`${name} must be a real calendar date.`);
    }

    return;
  }

  // -------------------
  // DATETIME MODE
  // -------------------
  if (mode === "datetime") {
    const datetimeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/;
    if (!datetimeRegex.test(value)) {
      throwValidationError(
        `${name} must be a valid ISO 8601 timestamp with timezone (UTC).`,
      );
    }

    const date = new Date(value);
    if (!Number.isFinite(date.getTime())) {
      throwValidationError(`${name} must be a valid ISO 8601 timestamp.`);
    }

    const [datePart, timePart] = value.split("T");
    const [year, month, day] = datePart.split("-").map(Number);
    const [hour, minute, second] = timePart
      .replace("Z", "")
      .split(":")
      .map(Number);
    const secondWhole = Math.floor(second);

    const isValid =
      date.getUTCFullYear() === year &&
      date.getUTCMonth() + 1 === month &&
      date.getUTCDate() === day &&
      date.getUTCHours() === hour &&
      date.getUTCMinutes() === minute &&
      date.getUTCSeconds() === secondWhole;

    if (!isValid) {
      throwValidationError(`${name} must be a real calendar date and time.`);
    }

    return;
  }

  // -------------------
  // INVALID MODE
  // -------------------
  throw new Error(
    `Invalid mode "${mode}" in validateISO. Must be "date" or "datetime".`,
  );
};

const validatePositiveNumber = (number, numberName) => {
  if (isNaN(number) || number <= 0 || typeof number !== "number") {
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

const validateName = (name, fieldName) => {
  if (typeof name !== "string")
    throwValidationError(`${fieldName} must be a string.`);

  const trimmed = name.trim();
  if (trimmed.length === 0) {
    throwValidationError(`${fieldName} cannot be empty.`);
  }
  if (trimmed.length < 2 || trimmed.length > 50) {
    throwValidationError(
      `${fieldName} must contain between 2 and 50 characters.`,
    );
  }

  const nameRegex = /^\p{L}+([ '-]\p{L}+)*$/u;
  if (!nameRegex.test(trimmed)) {
    throwValidationError(`${fieldName} contains forbidden characters.`);
  }
};

/* ================================================================================================= */
/*  EXPORTS                                                                                          */
/* ================================================================================================= */

module.exports = {
  throwValidationError,
  validateJsonContentType,
  assertRequestFields,
  assertString,
  validateUUID,
  validateISO,
  validatePositiveNumber,
  validateUsername,
  validateEmail,
  validatePassword,
  validateName,
};
