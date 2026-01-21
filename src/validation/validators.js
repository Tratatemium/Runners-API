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

const validateUUID = (ID, IDname = "ID") => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const isUUID = uuidRegex.test(ID);
  if (!isUUID) {
    throwValidationError(`${IDname} must be a valid UUID.`);
  }
};

const validateISODate = (timestamp, timestampName) => {
  if (typeof timestamp !== "string") {
    throwValidationError(
      `${timestampName} must be a string in ISO 8601 format.`,
    );
  }

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

/* ================================================================================================= */
/*  EXPORTS                                                                                          */
/* ================================================================================================= */

module.exports = {
  validateJsonContentType,
  assertRequestFields,
  validateUUID,
  validateISODate,
  validatePositiveNumber,
};
