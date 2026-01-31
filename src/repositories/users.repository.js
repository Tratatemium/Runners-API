const User = require("../models/users.models.js");
const { randomUUID } = require("crypto");

const findUserById = async (userId) => {
  const selectedUser = await User.findOne({ userId });
  return selectedUser || null;
};

const findUserByField = async (field, value) => {
  const selectedUser = await User.findOne({
    [field]: value,
  });
  return selectedUser || null;
};

const findUserByEmailOrUsername = async (identifier) => {
  const selectedUser = await User.findOne({
    $or: [{ "account.email": identifier }, { "account.username": identifier }],
  });
  return selectedUser || null;
};

const updateLastLogin = async (foundUser) => {
  const email = foundUser.account.email;
  const result = await User.updateOne(
    { "account.email": email },
    { $set: { "account.lastLogin": new Date() } },
  );
  return result;
};

const addNewUser = async (newUser) => {
  const newUserId = randomUUID();
  const userToInsert = { userId: newUserId, ...newUser };
  const savedUser = await User.create(userToInsert);
  console.log("New user added to the database. ID:", newUserId);
  return savedUser.userId;
};

const updateProfile = async (userId, profilePatch) => {
  const update = {};
  for (const [key, value] of Object.entries(profilePatch)) {
    update[`profile.${key}`] = value;
  }
  const result = await User.findOneAndUpdate(
    { userId },
    { $set: update },
    { new: true },
  );
  return result?.profile ?? null;
};

const updateAccount = async (userId, identifierName, newValue) => {
  const result = await User.updateOne(
    { userId },
    { $set: { [`account.${identifierName}`]: newValue } },
  );
  return result;
};

const updateCredentials = async (userId, newCredentials) => {
  const result = await User.updateOne(
    { userId },
    { $set: { credentials: newCredentials } },
  );
  return result;
};

const incrementAccessTokenVersion = async (userId) => {
  await User.updateOne(
    { userId },
    { $inc: { "auth.accessTokenVersion": 1 } },
  );
};

/* ================================================================================================= */
/*  EXPORTS                                                                                          */
/* ================================================================================================= */

module.exports = {
  findUserById,
  findUserByField,
  findUserByEmailOrUsername,
  updateLastLogin,
  addNewUser,
  updateProfile,
  updateAccount,
  updateCredentials,
  incrementAccessTokenVersion,
};
