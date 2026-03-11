const { createApp } = require("../src/app.js"); // export a factory
const { connectDB } = require("../src/utils/db.utils.js");

module.exports = async (req, res) => {
  try {
    console.log("Before DB connect");
    await connectDB();
    console.log("After DB connect");

    const app = createApp();       // create Express app **after DB connected**
    const handler = require("serverless-http")(app);
    await handler(req, res);
  } catch (err) {
    console.error("DB connection failed:", err);
    res.status(500).json({ error: "Database connection failed" });
  }
};
