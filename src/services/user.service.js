const usersRepo = require("../repositories/users.repository.js");

const updateProfile = async (userId, profilePatch) => {
  const savedProfile = await usersRepo.updateProfile(userId, profilePatch);
  if (savedProfile.matchedCount === 0) {
    const err = new Error("User not found.");
    err.status = 404;
    throw err;
  }
  return savedProfile;
};

module.exports = { updateProfile };
