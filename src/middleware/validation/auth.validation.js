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

module.exports = {
  validateRegisterRequest,
  validateLoginRequest,
};
