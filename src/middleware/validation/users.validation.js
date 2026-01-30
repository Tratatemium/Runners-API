const validators = require("./validators.js");

const validateRegisterRequest = (req, res, next) => {
  validators.validateJsonContentType(req);

  validators.assertRequestFields(
    req,
    ["username", "password", "email"],
    "User data",
    "require_all",
  );

  const { username, password, email } = req.body;

  validators.validateUsername(username);
  validators.validateEmail(email);
  validators.validatePassword(password);

  next();
};

const validateLoginRequest = (req, res, next) => {
  validators.validateJsonContentType(req);

  validators.assertRequestFields(req, ["password"], "User data", "require_all");
  validators.assertRequestFields(
    req,
    ["username", "email"],
    "User data",
    "require_some",
  );

  const { username, password, email } = req.body;

  if (email && username)
    validators.throwValidationError(
      "Provide either email or username, but not both.",
    );

  if (username !== undefined && username !== null)
    validators.validateUsername(username);
  if (email !== undefined && email !== null) validators.validateEmail(email);
  validators.validatePassword(password);

  next();
};

const validateUUID = (param = "id") => {
  return (req, res, next) => {
    validators.validateUUID(req.params[param]);
    next();
  };
};

const validateProfile = (req, res, next) => {
  validators.validateJsonContentType(req);
  const profile = req.body.profile;
  if (!profile || typeof profile !== "object" || Array.isArray(profile)) {
    validators.throwValidationError("profile (object) must be provided.");
  }

  const allowedFields = [
    "firstName",
    "lastName",
    "dateOfBirth",
    "heightCm",
    "weightKg",
  ];

  for (const key of Object.keys(profile)) {
    if (!allowedFields.includes(key)) {
      validators.throwValidationError(`Unknown field: ${key}`);
    }
  }

  const { firstName, lastName, dateOfBirth, heightCm, weightKg } = profile;

  if (firstName !== undefined && firstName !== null)
    validators.validateName(firstName, "firstName");

  if (lastName !== undefined && lastName !== null)
    validators.validateName(lastName, "lastName");

  if (dateOfBirth !== undefined && dateOfBirth !== null)
    validators.validateISODate(dateOfBirth, "dateOfBirth");

  if (heightCm !== undefined && heightCm !== null)
    validators.validatePositiveNumber(heightCm, "heightCm");

  if (weightKg !== undefined && weightKg !== null)
    validators.validatePositiveNumber(weightKg, "weightKg");

  next();
};

/* ================================================================================================= */
/*  EXPORTS                                                                                          */
/* ================================================================================================= */

module.exports = {
  validateRegisterRequest,
  validateLoginRequest,
  validateUUID,
  validateProfile,
};
