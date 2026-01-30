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

};

// TODO: Add profile field validation here if/when profile data is supported.
//  "profile": {
//      "firstName": "Alex",
//      "lastName": "Miller",
//      "dateOfBirth": "1995-06-18",
//      "heightCm": 178,
//      "weightKg": 72
//    }

/* ================================================================================================= */
/*  EXPORTS                                                                                          */
/* ================================================================================================= */

module.exports = {
  validateRegisterRequest,
  validateLoginRequest,
  validateUUID,
  validateProfile
};
