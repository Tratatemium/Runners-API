const { MongoServerSelectionError, MongoNetworkError } = require("mongodb");

// JSON syntax error filter
const jsonSyntaxErrorHandler = (err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).send("Invalid JSON.");
  }
  return next(err);
};

// Database error filter
const dbErrorHandler = (err, req, res, next) => {
  if (
    err instanceof MongoServerSelectionError ||
    err instanceof MongoNetworkError
  ) {
    return res.status(500).send("Failed to connect to database.");
  }
  return next(err);
};

// FINAL error handler
const finalErrorHandler = (err, req, res, next) => {
  const status =
    Number.isInteger(err.status) && err.status >= 400 ? err.status : 500;
  const message = err.message || "Internal Server Error";

  res.status(status).send(message);
};

module.exports = { jsonSyntaxErrorHandler, dbErrorHandler, finalErrorHandler };
