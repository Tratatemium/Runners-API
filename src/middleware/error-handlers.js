const {
  MongoNetworkError,
  MongoServerSelectionError,
  MongoServerError,
} = require("mongodb");

// JSON syntax error filter
const jsonSyntaxErrorHandler = (err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ error: "Invalid JSON." });
  }
  next(err);
};

// Database error filter
const dbErrorHandler = (err, req, res, next) => {
  const isDuplicateKey = err instanceof MongoServerError && err.code === 11000;

  if (isDuplicateKey) {
    const field = Object.keys(err.keyValue || {})[0];
    const value = field ? err.keyValue[field] : undefined;

    return res.status(409).json({
      error: field
        ? `${field.slice(8)} ${value} already exists.` // TODO: take field dynamicly
        : "Duplicate key error",
    });
  }

  const isConnectionError =
    err instanceof MongoServerSelectionError ||
    err instanceof MongoNetworkError;

  if (isConnectionError) {
    console.error(err);
    return res.status(500).json({ error: "Failed to connect to database." });
  }

  next(err);
};

const authErrorHandler = (err, req, res, next) => {
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({ error: "Invalid token." });
  }
  if (err.name === "TokenExpiredError") {
    return res.status(401).json({ error: "Token expired." });
  }
  if (err.name === "NotBeforeError") {
    return res.status(401).json({ error: err.message });
  }
  // Malformed JWT payload (JSON.parse failed)
  if (err instanceof SyntaxError && err.message.includes("Unexpected token")) {
    return res.status(401).json({ error: "Malformed token payload." });
  }
  next(err);
};

// FINAL error handler
const finalErrorHandler = (err, req, res, next) => {
  const isValidErrStatus = Number.isInteger(err.status) && err.status >= 400;

  const status = isValidErrStatus ? err.status : 500;
  const message =
    isValidErrStatus && err.message ? err.message : "Internal Server Error";

  if (status >= 500) console.error(err);

  res.status(status).json({ error: message });
};

module.exports = {
  jsonSyntaxErrorHandler,
  dbErrorHandler,
  authErrorHandler,
  finalErrorHandler,
};
