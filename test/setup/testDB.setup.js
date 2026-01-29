const { MongoMemoryServer } = require("mongodb-memory-server");
const dbUtils = require("../../src/utils/db.utils.js");

let mongo;

const setup = async () => {
  mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();

  await dbUtils.connectDB(uri);
};

const teardown = async () => {
  await dbUtils.closeDB();
  await mongo.stop();
};

const clear = async () => {
  await dbUtils.clearDB();
};

module.exports = { setup, teardown, clear };
