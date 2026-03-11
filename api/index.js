const serverless = require("serverless-http");
const app = require("../src/app.js");
const { connectDB } = require("../src/utils/db.utils.js");

const handler = serverless(app);
let connected = false;

module.exports = (req, res) => {
  if (!connected) {
    connectDB()
      .then(() => {
        connected = true;
        handler(req, res);
      })
      .catch(err => {
        console.error("DB connection error:", err);
        res.status(500).json({ error: "DB connection failed" });
      });
  } else {
    handler(req, res);
  }
};
