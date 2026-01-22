const testDb = require("./testDB.setup.js");
const seeding = require("./seeds/seeding.js");

beforeAll(async () => {
  await testDb.setup();
  await seeding.seedData("runs");
  await seeding.seedData("users");
});

afterAll(async () => {
  await testDb.clear();
  await testDb.teardown();
});
