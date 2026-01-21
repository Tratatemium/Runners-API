const validators = require("./validators.js");

const parseAndValidateUser = async (req) => {
  validators.validateJsonContentType(req);

  validators.assertRequestFields(
    req,
    ["username", "password", "email"],
    "User data",
  );

  const { username, password, email } = req.body;

  validators.validateUsername(username);
  // TODO: Add username uniqueness validation (e.g., assertUsernameUnique)

  validators.validateEmail(email);
  // TODO: Add email uniqueness validation (e.g., assertEmailUnique)

  validators.validatePassword(password);

  const validated = {
    username,
    email,
  };

  return { userData: validated, plainTextPassword: password };
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
  parseAndValidateUser,
};
