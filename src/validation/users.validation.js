const validators = require("./validators.js");

const parseAndValidateUser = async (req) => {
  validators.validateJsonContentType(req);

  validators.assertRequestFields(
    req,
    ["username", "password", "email"],
    "User data",
  );

  const { username, password, email } = req.body;

  validateUsername(username);
  await assertUsernameUnique(username);

  validateEmail(email);
  await assertEmailUnique(email);

  validatePassword(password);

  const validated = {
    username,
    email,
  };

  return { userData: validated, plainTextPassword: password };
};

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
