const mongoose = require("mongoose");

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
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    // Reset cached promise/connection so future calls can retry
    cached.promise = null;
    cached.conn = null;
    throw err;
  }

  console.log("Connected to database (Mongoose).");

  return cached.conn;
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
  closeDB,
  clearDB,
};
