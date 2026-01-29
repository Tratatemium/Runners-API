const findUserById = async (userId) => {
  const users = getCollection("users");

  const selectedUser = await users.findOne({
    userId: userId,
  });
  return selectedUser || null;
};

const findUserByField = async (field, value) => {
  const users = getCollection("users");
  const selectedUser = await users.findOne({
    [field]: value,
  });
  return selectedUser || null;
};

const updateLastLogin = async (foundUser) => {
  const email = foundUser.account.email;
  const users = getCollection("users");
  const result = await users.updateOne(
    { "account.email": email }, // filter
    { $set: { "account.lastLogin": new Date().toISOString() } }, // update
  );
  return result;
};

const addNewUser = async (newUser) => {
  const users = getCollection("users");

  const newUserId = randomUUID();
  const userToInsert = { userId: newUserId, ...newUser };
  const result = await users.insertOne(userToInsert);
  if (!result.acknowledged) {
    const err = new Error("Failed to save new user.");
    err.status = 500;
    throw err;
  }
  console.log("New user added to the database. ID:", newUserId);
  return newUserId;
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