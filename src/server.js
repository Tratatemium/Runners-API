const app = require("./app");
const { connectDB } = require("./utils/db.utils.js");
try {
  const { PORT } = require("./config/env.config");
} catch (err) {
  console.error("Configuration error:", err.message);
  process.exit(1);
}

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`API server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Startup error:", err);
    process.exit(1);
  }
};

startServer();
