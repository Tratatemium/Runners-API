const serverless = require("serverless-http");
const app = require("../src/app.js");
const { connectDB } = require("../src/utils/db.utils.js");

const handler = serverless(app);
let connected = false;

module.exports = async (req, res) => {
  try {
    if (!connected) {
      await connectDB();
      connected = true;
    }

    return handler(req, res);
  } catch (err) {
    console.error("DB connection failed:", err);
    return res.status(500).json({ error: "Database connection failed" });
  }
};
