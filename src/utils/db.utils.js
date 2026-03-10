const mongoose = require("mongoose");
const { MONGO_URI } = require("../config/env.config.js");

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async (uri = process.env.MONGO_URI) => {
  if (!uri) {
    throw new Error("MongoDB URI not provided");
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, {
      dbName: "runners-app",
    });
  }

  cached.conn = await cached.promise;

  console.log("Connected to database (Mongoose).");

  return cached.conn;
};

// const connectDB = async (uri = MONGO_URI) => {
//   if (!uri) {
//     throw new Error("MongoDB URI not provided");
//   }
//   await mongoose.connect(uri, {
//     dbName: "runners-app",
//   });
//   console.log("Connected to database (Mongoose).");
// };

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
