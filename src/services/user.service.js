const usersRepo = require("../repositories/users.repository.js");
const auth = require("./auth.service.js");

const throwUserNotFoundError = () => {
  const err = new Error("User not found.");
  err.status = 404;
  throw err;
};

const updateProfile = async (userId, profilePatch) => {
  const savedProfile = await usersRepo.updateProfile(userId, profilePatch);
  if (!savedProfile) throwUserNotFoundError();
  return savedProfile;
};

const updateAccount = async (req, fieldToUpdate) => {
  const userId = req.user.userId;
  let result;
  switch (fieldToUpdate) {
    case "password": {
      const newPassword = req.body.newPassword;
      result = await auth.updatePassword(userId, newPassword);
      break;
    }

    case "email": {
      const newEmail = req.body.newEmail;
      result = await usersRepo.updateAccount(userId, "email", newEmail);
      break;
    }

    case "username": {
      const newUsername = req.body.newUsername;
      result = await usersRepo.updateAccount(userId, "username", newUsername);
      break;
    }
    default:
      throw new Error(
        `fieldToUpdate must be "password", "email", or "username".`,
      );
  }
  if (result.matchedCount === 0) throwUserNotFoundError();
};

module.exports = { updateProfile, updateAccount };
