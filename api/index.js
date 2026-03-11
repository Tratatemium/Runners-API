const serverless = require("serverless-http");
const app = require("../src/app.js");
const { connectDB } = require("../src/utils/db.utils.js");

let cached = global._mongo;
if (!cached) cached = global._mongo = { conn: null, promise: null };

const connectDatabase = async () => {
  if (!cached.conn) {
    if (!cached.promise) cached.promise = connectDB();
    cached.conn = await cached.promise;
  }
  return cached.conn;
};

// Wrap serverless handler
const handler = serverless(app);

module.exports = async (req, res) => {
  try {
    console.log("Before DB connect");
    await connectDatabase();
    console.log("After DB connect, readyState:", require("mongoose").connection.readyState);

    await handler(req, res);
  } catch (err) {
    console.error("DB connection failed:", err);
    res.status(500).json({ error: "Database connection failed" });
  }
};
