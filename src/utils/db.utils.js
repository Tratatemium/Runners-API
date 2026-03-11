const mongoose = require("mongoose");

let cached = global._mongo;
if (!cached) cached = global._mongo = { conn: null, promise: null };

const connectDB = async (uri = process.env.MONGO_URI) => {
  if (!uri) throw new Error("MongoDB URI not provided");

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(uri, {
        dbName: "runners-app",
      })
      .catch((err) => {
        cached.promise = null;
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    cached.conn = null;
    throw err;
  }

  console.log("Connected to database (Mongoose).");
  return cached.conn;
};

const checkDBConnection = () => {
  const states = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };
  return states[mongoose.connection.readyState];
};

const closeDB = async () => {
  await mongoose.connection.close();
  cached.conn = null;
  cached.promise = null;
};

const clearDB = async () => {
  const collections = mongoose.connection.collections;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
};

module.exports = {
  connectDB,
  checkDBConnection,
  closeDB,
  clearDB,
};
