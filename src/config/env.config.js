const dotenv = require("dotenv");

dotenv.config();

/**
 * Ensure a required environment variable is present.
 * @param {string} key
 * @param {string} purpose
 * @returns {string}
 */
const requireEnv = (key, purpose) => {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `${key} environment variable is not set. Required ${purpose}.`,
    );
  }
  return value;
};

/**
 * Get and validate PORT environment variable
 * @returns {number}
 */
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

const MONGO_URI = requireEnv("MONGO_URI", "to connect to MongoDB");
const TOKEN_KEY = requireEnv("TOKEN_KEY", "to sign and verify JWTs");
const PORT = getPort();

module.exports = {
  MONGO_URI,
  TOKEN_KEY,
  PORT,
};
