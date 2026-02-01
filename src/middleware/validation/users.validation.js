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

  if (username != null) validators.validateUsername(username);
  if (email != null) validators.validateEmail(email);
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

  if (firstName != null) validators.validateName(firstName, "firstName");
  if (lastName != null) validators.validateName(lastName, "lastName");
  if (dateOfBirth != null)
    validators.validateISODate(dateOfBirth, "dateOfBirth");
  if (heightCm != null) validators.validatePositiveNumber(heightCm, "heightCm");
  if (weightKg != null) validators.validatePositiveNumber(weightKg, "weightKg");

  next();
};

const validateAccountUpdate = (req, res, next) => {
  validators.validateJsonContentType(req);

  const { currentPassword, newPassword, newEmail, newUsername } = req.body;

  if (currentPassword == null) {
    validators.throwValidationError("currentPassword must be provided.");
  }
  validators.validatePassword(currentPassword);

  const updateFields = [
    { key: "password", value: newPassword, validate: validators.validatePassword },
    { key: "email", value: newEmail, validate: validators.validateEmail },
    { key: "username", value: newUsername, validate: validators.validateUsername }
  ];
  
  const provided = updateFields.filter(field => field.value != null);

  if (provided.length !== 1) {
    validators.throwValidationError(
      "Request body must include currentPassword and only one of: newPassword, newEmail, newUsername.",
    );
  }

  const fieldToUpdate = provided[0];
  fieldToUpdate.validate(fieldToUpdate.value);
  req.fieldToUpdate = fieldToUpdate.key;

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
  validateAccountUpdate,
};
