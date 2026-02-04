const validators = require("./validators.js");

const validateUUID = (param = "id") => {
  return (req, res, next) => {
    validators.validateUUID(req.params[param]);
    next();
  };
};

const validateProfileUpdate = (req, res, next) => {
  validators.validateJsonContentType(req);
  const profile = req.body.profile;

  validators.assertRequestFields({
    object: profile,
    objectName: "profile",
    requiredFields: [
      "firstName",
      "lastName",
      "dateOfBirth",
      "heightCm",
      "weightKg",
    ],
    mode: "require_some",
  });

  const { firstName, lastName, dateOfBirth, heightCm, weightKg } = profile;

  if (firstName != null) validators.validateName(firstName, "firstName");
  if (lastName != null) validators.validateName(lastName, "lastName");
  if (dateOfBirth != null)
    validators.validateISO(dateOfBirth, "dateOfBirth", "date");
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
    {
      key: "password",
      value: newPassword,
      validate: validators.validatePassword,
    },
    { key: "email", value: newEmail, validate: validators.validateEmail },
    {
      key: "username",
      value: newUsername,
      validate: validators.validateUsername,
    },
  ];

  const provided = updateFields.filter((field) => field.value != null);

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
  validateUUID,
  validateProfileUpdate,
  validateAccountUpdate,
};
