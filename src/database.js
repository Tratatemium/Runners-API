/* ================================================================================================= */
/*  IMPORTS                                                                                          */
/* ================================================================================================= */

const { MongoClient, ObjectId } = require("mongodb");
const dotenv = require("dotenv");
const { randomUUID } = require("crypto");

/* ================================================================================================= */
/*  CONFIGURATION                                                                                    */
/* ================================================================================================= */

if (!process.env.MONGO_URI) {
  dotenv.config();
}

/* ================================================================================================= */
/*  DATABASE INITIALIZATION                                                                          */
/* ================================================================================================= */

const client = new MongoClient(process.env.MONGO_URI);
let db;

const connectDB = async () => {
  await client.connect();
  console.log("Connected to database.");
  db = client.db("runners-app");
};

const getCollection = (collectionName) => {
  if (!db) {
    const err = new Error(
      "Database not initialized. Ensure connectDB() has completed before accessing collections."
    );
    err.status = 500;
    throw err;
  }
  return db.collection(collectionName);
};

/* ================================================================================================= */
/*  DATABASE OPERATIONS                                                                              */
/* ================================================================================================= */

const getRunByID = async (runID) => {
  const runs = getCollection("runs");

  const selectedRun = await runs.findOne({
    runID: runID,
  });
  if (!selectedRun) {
    const err = new Error(`No run with ID ${runID} found!`);
    err.status = 404;
    throw err;
  }
  return selectedRun;
};

const addNewRun = async (runJSON) => {
  const runs = getCollection("runs");

  const newRunID = randomUUID();
  runJSON.runID = newRunID;

  const result = await runs.insertOne(runJSON);
  if (!result.acknowledged) {
    const err = new Error("Failed to save new run.");
    err.status = 500;
    throw err;
  }
  console.log("New run added to the database. ID:", newRunID);
  return newRunID;
};

/* ================================================================================================= */
/*  EXPORTS                                                                                          */
/* ================================================================================================= */

module.exports = {
  connectDB,
  getRunByID,
  addNewRun,
};
