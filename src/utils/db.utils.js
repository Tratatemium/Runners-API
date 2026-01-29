const mongoose = require("mongoose");
const dotenv = require("dotenv");

if (!process.env.MONGO_URI) {
  dotenv.config();
}

const connectDB = async (uri = process.env.MONGO_URI) => {
  if (!uri) {
    throw new Error("MongoDB URI not provided");
  }

  await mongoose.connect(uri, {
    dbName: "runners-app",
  });

  console.log("Connected to database (Mongoose).");
};

const closeDB = async () => {
  await mongoose.connection.close();
};

const clearDB = async () => {
  const collections = mongoose.connection.collections;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
};

module.exports = {
  connectDB,
  closeDB,
  clearDB,
};
