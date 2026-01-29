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

/* ================================================================================================= */
/*  EXPORTS                                                                                          */
/* ================================================================================================= */

module.exports = {
  findUserById,
  findUserByField,
  updateLastLogin,
  addNewUser,
};
