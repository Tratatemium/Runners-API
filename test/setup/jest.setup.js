const testDb = require("../testDB.setup.js");
const seeding = require("../seeds/seeding.js");
const { afterEach } = require("node:test");

beforeAll(async () => {
  await testDb.setup();
  await seeding.seedData("users");
  await seeding.seedData("runs");  
});

afterAll(async () => {
  await testDb.clear();
  await testDb.teardown();
});
