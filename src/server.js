/* ================================================================================================= */
/*  ENV CONFIG                                                                                       */
/* ================================================================================================= */

const dotenv = require("dotenv");

const loadEnv = () => dotenv.config();

const requireEnv = (key, purpose) => {
  const value = process.env[key];

  if (!value) {
    throw new Error(
      `${key} environment variable is not set. Required ${purpose}.`,
    );
  }

  return value;
};

const getPort = () => {
  const portValue = requireEnv("PORT", "to run express API");
  const port = Number(portValue);

  const isValidPort = Number.isInteger(port) && port >= 0 && port < 65536;

  if (!isValidPort) {
    throw new Error(
      `PORT environment variable must be an integer between 0 and 65535.`,
    );
  }

  return port;
};

let PORT;

try {
  loadEnv();
  requireEnv("MONGO_URI", "to connect to MongoDB");
  requireEnv("TOKEN_KEY", "to sign and verify JWTs");
  PORT = getPort();
} catch (err) {
  console.error("Configuration error:", err.message);
  process.exit(1);
}

/* ================================================================================================= */
/*  BOOTSTRAP                                                                                        */
/* ================================================================================================= */

const app = require("./app");
// const { connectDB } = require("./database");
const { connectDB } = require("./utils/db.utils.js");

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
