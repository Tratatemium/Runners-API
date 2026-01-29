const testDb = require("./testDB.setup.js");
const seeding = require("../helpers/seeding.js");
const User = require("../../src/models/users.models.js");
const Run = require("../../src/models/runs.models.js");

beforeAll(async () => {
  await testDb.setup();
  await seeding.seedData(User, "users");
  await seeding.seedData(Run, "runs");  
});

afterAll(async () => {
  await testDb.clear();
  await testDb.teardown();
});
