const validators = require("./validators.js");

const validateRegisterRequest = (req, res, next) => {
  validators.validateJsonContentType(req);

  validators.assertRequestFields({
    object: req.body,
    objectName: "User data",
    requiredFields: ["username", "password", "email"],
    mode: "require_all",
  });

  const { username, password, email } = req.body;

  validators.validateUsername(username);
  validators.validateEmail(email);
  validators.validatePassword(password);

  next();
};

const validateLoginRequest = (req, res, next) => {
  validators.validateJsonContentType(req);

  if (req.body.password == null) {
    validators.throwValidationError({
      message: "Login request must include password.",
      field: "password",
    });
  }
  validators.assertRequestFields({
    object: req.body,
    objectName: "Login request",
    requiredFields: ["username", "email"],
    allowedFields: ["username", "email", "password"],
    mode: "require_some",
  });

  const { username, password, email } = req.body;

  if (email && username)
    validators.throwValidationError({
      message: "Provide either email or username, but not both.",
      field: "identifier",
    });

  if (username != null) validators.validateUsername(username);
  if (email != null) validators.validateEmail(email);
  validators.validatePassword(password);

  next();
};

module.exports = {
  validateRegisterRequest,
  validateLoginRequest,
};
