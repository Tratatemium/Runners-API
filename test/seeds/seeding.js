const fs = require("fs");
const path = require("path");
const { getCollection } = require("../../src/database");

const seedData = async (collectionName) => {
    const collection = getCollection(collectionName);

    const filePath = path.join(__dirname, `${collectionName}.seeds.json`);
    const rawData = fs.readFileSync(filePath, "utf8");
    const seedData = JSON.parse(rawData);

    await collection.insertMany(seedData);
};

module.exports = { seedData };