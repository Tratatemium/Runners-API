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

const updateAccount = async (userId, fieldToUpdate, reqBody) => {
  const handlers = {
    password: (userId, reqBody) =>
      auth.updatePassword(userId, reqBody.newPassword),
    email: (userId, reqBody) =>
      usersRepo.updateAccount(userId, "email", reqBody.newEmail),
    username: (userId, reqBody) =>
      usersRepo.updateAccount(userId, "username", reqBody.newUsername),
  };

  const handler = handlers[fieldToUpdate];
  if (!handler) {
    throw new Error("Invalid fieldToUpdate");
  }

  const result = await handler(userId, reqBody);
  if (result?.matchedCount === 0) throwUserNotFoundError();
};

module.exports = { updateProfile, updateAccount };
