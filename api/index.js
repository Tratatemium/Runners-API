const serverless = require("serverless-http");
const app = require("../src/app.js");
const { connectDB } = require("../src/utils/db.utils.js");

const handler = serverless(app);
let connected = false;

module.exports = async (req, res) => {
  try {
    const requestUrl = new URL(req.url, "http://localhost");
    const forwardedPath = requestUrl.searchParams.get("path");

    if (forwardedPath) {
      requestUrl.pathname = `/${forwardedPath}`;
      requestUrl.searchParams.delete("path");

      const normalizedSearch = requestUrl.searchParams.toString();
      req.url = normalizedSearch
        ? `${requestUrl.pathname}?${normalizedSearch}`
        : requestUrl.pathname;
    }

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
