const app = require("../src/app.js");
const { connectDB } = require("../src/utils/db.utils.js");

let connected = false;

try {
  if (!connected) {
    await connectDB();
    connected = true;
  }
} catch (err) {
  console.error("DB connection failed:", err);
}

export default app;
