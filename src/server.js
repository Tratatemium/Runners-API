/* ================================================================================================= */
/*  ENV CONFIG                                                                                       */
/* ================================================================================================= */

const dotenv = require("dotenv");

const requireEnv = (key, purpose) => {
  const value = process.env[key];

  if (!value) {
    throw new Error(
      `${key} environment variable is not set. Required ${purpose}.`
    );
  }

  return value;
};

const configEnv = () => {
  dotenv.config();

  requireEnv("MONGO_URI", "to connect to MongoDB");
  requireEnv("TOKEN_KEY", "to sign and verify JWTs");
};

try {
  configEnv();
} catch (err) {
  console.error("Configuration error:", err);
  process.exit(1);
}

/* ================================================================================================= */
/*  BOOTSTRAP                                                                                        */
/* ================================================================================================= */

const app = require("./app");
const { connectDB } = require("./database");

const PORT = Number(process.env.PORT) || 3000;

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