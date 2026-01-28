const { MongoMemoryServer } = require("mongodb-memory-server");
const database = require("../src/database.js");

let mongo;

const setup = async () => {
  mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();

  await database.connectDB(uri);
};

const teardown = async () => {
  await database.closeDB();
  await mongo.stop();
};

const clear = async () => {
  await database.clearDB();
};

module.exports = { setup, teardown, clear };
