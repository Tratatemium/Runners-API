/* ================================================================================================= */
/*  IMPORTS                                                                                          */
/* ================================================================================================= */

const { MongoClient } = require("mongodb");
const { randomUUID } = require("crypto");

/* ================================================================================================= */
/*  CONFIGURATION                                                                                    */
/* ================================================================================================= */

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error(
    "MONGO_URI environment variable is not set. It must be defined to connect to mongoDB"
  );
}

/* ================================================================================================= */
/*  DATABASE INITIALIZATION                                                                          */
/* ================================================================================================= */

let client;
let db;

const connectDB = async (uri = process.env.MONGO_URI) => {
  if (!uri) {
    throw new Error("MongoDB URI not provided");
  }
  client = new MongoClient(uri);
  await client.connect();
  db = client.db("runners-app");

  await db.collection("users").createIndex(
    { username: 1 },
    { unique: true }
  );
  await db.collection("users").createIndex(
    { email: 1 },
    { unique: true }
  );

  console.log("Connected to database.");
};

const closeDB = async () => {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
};

const clearDB = async () => {
  if (!db) return;

  const collections = await db.collections();
  for (const collection of collections) {
    await collection.deleteMany({});
  }
};

const getCollection = (collectionName) => {
  if (!db) {
    const err = new Error(
      "Database not initialized. Ensure connectDB() has completed before accessing collections.",
    );
    err.status = 500;
    throw err;
  }
  return db.collection(collectionName);
};

/* ================================================================================================= */
/*  DATABASE OPERATIONS                                                                              */
/* ================================================================================================= */

const findRunById = async (runId) => {
  const runs = getCollection("runs");

  const selectedRun = await runs.findOne({
    runId: runId,
  });
  return selectedRun || null;
};

const addNewRun = async (newRun) => {
  const runs = getCollection("runs");

  const newRunId = randomUUID();
  const runToInsert = { runId: newRunId, ...newRun };

  const result = await runs.insertOne(runToInsert);
  if (!result.acknowledged) {
    const err = new Error("Failed to save new run.");
    err.status = 500;
    throw err;
  }
  console.log("New run added to the database. ID:", newRunId);
  return newRunId;
};

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
  connectDB,
  getCollection,
  closeDB,
  clearDB,
  findRunById,
  addNewRun,
  findUserById,
  findUserByField,
  addNewUser,
};
