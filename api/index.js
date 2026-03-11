const serverless = require("serverless-http");
const app = require("../src/app.js");
const { connectDB } = require("../src/utils/db.utils.js");

const handler = serverless(app);

// global cache for serverless cold starts
let cached = global._mongo;
if (!cached) cached = global._mongo = { conn: null, promise: null };

module.exports = async (req, res) => {
  try {
    if (!cached.conn) {
      if (!cached.promise) cached.promise = connectDB();
      cached.conn = await cached.promise;
    }
    return handler(req, res); // await is optional here; serverless-http handles it
  } catch (err) {
    console.error("DB connection failed:", err);
    return res.status(500).json({ error: "Database connection failed" });
  }
};
