const fs = require("fs");
const path = require("path");

/**
 * Seed a Mongoose model with data from a fixture JSON file
 * 
 * Reads a JSON fixture file from the fixtures directory and inserts
 * all documents into the specified Mongoose model's collection.
 * 
 * @param {mongoose.Model} Model - Mongoose model to seed
 * @param {string} pathName - Name of the fixture file (without .fixture.json extension)
 * @returns {Promise<void>} Promise that resolves when seeding is complete
 * @throws {Error} If Model is invalid or not a Mongoose model
 * @throws {Error} If fixture file cannot be read or parsed
 * 
 * @example
 * const User = require('../models/users.models');
 * await seedData(User, 'users');
 */
const seedData = async (Model, pathName) => {
  if (!Model || !Model.collection) {
    throw new Error("A valid Mongoose model must be provided");
  }

  const filePath = path.join(__dirname, "..", "fixtures", `${pathName}.fixture.json`);
  const rawData = fs.readFileSync(filePath, "utf8");
  const documents = JSON.parse(rawData);

  await Model.insertMany(documents);
};

module.exports = { seedData };
