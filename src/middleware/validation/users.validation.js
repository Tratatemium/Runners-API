const validators = require("./validators.js");

const validateRegisterRequest = async (req, res, next) => {
  validators.validateJsonContentType(req);

  validators.assertRequestFields(
    req,
    ["username", "password", "email"],
    "User data",
  );

  const { username, password, email } = req.body;

  validators.validateUsername(username);
  validators.validateEmail(email);
  validators.validatePassword(password);

  next()
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
};
