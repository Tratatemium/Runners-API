/**
 * Custom assertion helpers for common test patterns
 */

/**
 * Assert that a response contains a valid JWT token
 * @param {Object} response - Supertest response object
 */
const expectValidJwtToken = (response) => {
  expect(response.statusCode).toBe(200);
  expect(response.headers["content-type"]).toMatch(/json/);
  expect(response.body).toHaveProperty("status", "success");
  expect(response.body).toHaveProperty("data");
  expect(response.body.data).toHaveProperty("token");
  expect(typeof response.body.data.token).toBe("string");
  expect(response.body.data.token.length).toBeGreaterThan(0);
  expect(response.body.data.token).toMatch(
    /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/,
  );
};

/**
 * Assert that a run object has the correct structure and data types
 * @param {Object} run - Run object to validate
 */
const expectValidRunStructure = (run) => {
  expect(run).toHaveProperty("runId");
  expect(run).toHaveProperty("userId");
  expect(run).toHaveProperty("startTime");
  expect(run).toHaveProperty("durationSec");
  expect(run).toHaveProperty("distanceMeters");

  expect(typeof run.runId).toBe("string");
  expect(typeof run.userId).toBe("string");
  expect(typeof run.startTime).toBe("string");
  expect(typeof run.durationSec).toBe("number");
  expect(typeof run.distanceMeters).toBe("number");

  expect(new Date(run.startTime).toString()).not.toBe("Invalid Date");
  expect(run.durationSec).toBeGreaterThan(0);
  expect(run.distanceMeters).toBeGreaterThan(0);
};

/**
 * Assert that a user object has the correct structure
 * @param {Object} user - User object to validate
 * @param {Object} expectedAccount - Expected account data
 */
const expectValidUserStructure = (user, expectedAccount = {}) => {
  expect(user).toHaveProperty("account");
  expect(user).toHaveProperty("profile");
  expect(user).not.toHaveProperty("_id");
  expect(user).not.toHaveProperty("credentials");

  if (expectedAccount.username) {
    expect(user.account).toHaveProperty("username", expectedAccount.username);
  }
  if (expectedAccount.email) {
    expect(user.account).toHaveProperty("email", expectedAccount.email);
  }
};

/**
 * Assert that a response is a 400 error with specific message
 * @param {Object} response - Supertest response object
 * @param {string|RegExp} errorMessage - Expected error message or pattern
 */
const expect400WithMessage = (response, errorMessage) => {
  expect(response.statusCode).toBe(400);
  expect(response.headers["content-type"]).toMatch(/json/);
  expect(response.body).toHaveProperty("error");

  if (typeof errorMessage === "string") {
    expect(response.body.error).toBe(errorMessage);
  } else {
    expect(response.body.error).toMatch(errorMessage);
  }
};

/**
 * Assert that a response is a 401 error
 * @param {Object} response - Supertest response object
 */
const expect401Error = (response) => {
  expect(response.statusCode).toBe(401);
  expect(response.headers["content-type"]).toMatch(/json/);
  expect(response.body).toHaveProperty("error");
};

/**
 * Assert that a response is a 403 error
 * @param {Object} response - Supertest response object
 */
const expect403Error = (response) => {
  expect(response.statusCode).toBe(403);
  expect(response.headers["content-type"]).toMatch(/json/);
  expect(response.body).toHaveProperty("error");
};

/**
 * Assert that a response is a 404 error
 * @param {Object} response - Supertest response object
 */
const expect404Error = (response) => {
  expect(response.statusCode).toBe(404);
  expect(response.headers["content-type"]).toMatch(/json/);
  expect(response.body).toHaveProperty("error");
};

/**
 * Assert that a response is a 409 error
 * @param {Object} response - Supertest response object
 */
const expect409Error = (response) => {
  expect(response.statusCode).toBe(409);
  expect(response.headers["content-type"]).toMatch(/json/);
  expect(response.body).toHaveProperty("error");
};

/**
 * Assert that a response is a 409 error
 * @param {Object} response - Supertest response object
 */
const expect415Error = (response) => {
  expect(response.statusCode).toBe(415);
  expect(response.headers["content-type"]).toMatch(/json/);
  expect(response.body).toHaveProperty("error");
};

/**
 * Common assertions for successful JSON responses
 * @param {Object} response - Supertest response object
 * @param {number} expectedStatus - Expected HTTP status code (default 200)
 */
const expectJsonResponse = (response, expectedStatus = 200) => {
  expect(response.statusCode).toBe(expectedStatus);
  expect(response.headers["content-type"]).toMatch(/json/);
};

module.exports = {
  expectValidJwtToken,
  expectValidRunStructure,
  expectValidUserStructure,
  expect400WithMessage,
  expect401Error,
  expect403Error,
  expect404Error,
  expect409Error,
  expect415Error,
  expectJsonResponse,
};
