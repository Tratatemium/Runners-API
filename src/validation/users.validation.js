/* ================================================================================================= */
/*  USER DATA VALIDATION                                                                             */
/* ================================================================================================= */

const validateUserFields = ({ username, password, email }) => {
  isUsernameValid(username);
  isUsernameUnique(username);

  isEmailValid(email);
  isEmailUnique(email);

  isPasswordValid(password);

  const validated = {
    username,
    email,
  };

  return { userData: validated, plainTextPassword: password };
};

const parseAndValidateUser = (req) => {
  validateJsonContentType(req);

  const { username, password, email } = req.body;

  const { userData, plainTextPassword } = validateUserFields({
    username,
    password,
    email,
  });

  return { userData, plainTextPassword };
};

// const validateUserFields = ({
//   username,
//   password,
//   email,
//   firstName,
//   lastName,
//   dateOfBirth,
//   heightCm,
//   weightKg,
// }) => {
//   // To be implemented

//   const validated = {
//     username,
//     email,
//     profile: {
//       firstName,
//       lastName,
//       dateOfBirth,
//       heightCm,
//       weightKg,
//     }
//   };

//   return { userData: validated, plainTextPassword: password };
// };

// const parseAndValidateUser = (req) => {
//   validateJsonContentType(req);

//   const { username, password, email, profile } = req.body;
//   const { firstName, lastName, dateOfBirth, heightCm, weightKg } = profile;

//   const { userData, plainTextPassword } = validateUserFields({
//     username,
//     password,
//     email,
//     firstName,
//     lastName,
//     dateOfBirth,
//     heightCm,
//     weightKg,
//   });
//   return { userData, plainTextPassword };
// };

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
  validateUUID,
  validateISODate,
  parseAndValidateRun,
  parseAndValidateUser,
};
