const app = require("../src/app.js");
const { connectDB } = require("../src/utils/db.utils.js");
const { setServerStartTime } = require("../src/utils/server.utils.js");

setServerStartTime();

let connected = false;

const connectionHandler = async () => {
  try {
    if (!connected) {
      await connectDB();
      connected = true;
    }
    return app;
  } catch (err) {
    console.error("DB connection failed:", err);
    connected = false;
    throw err;
  }
};

module.exports = connectionHandler;
