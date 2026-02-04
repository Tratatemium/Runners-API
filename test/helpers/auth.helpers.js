const request = require("supertest");
const app = require("../../src/app.js");

/**
 * Login and get authentication token for a user
 * @param {Object} credentials - User credentials (email or username + password)
 * @returns {Promise<string>} JWT token
 */
const getAuthToken = async (credentials) => {
  const loginRes = await request(app).post("/api/v1/auth/login").send(credentials);
  
  if (loginRes.statusCode !== 200) {
    throw new Error(`Login failed with status ${loginRes.statusCode}: ${JSON.stringify(loginRes.body)}`);
  }
  
  return loginRes.body.data.token;
};

/**
 * Create a new user via signup endpoint
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} Created user response body
 */
const createUser = async (userData) => {
  const response = await request(app).post("/api/v1/auth/signup").send(userData);
  
  if (response.statusCode !== 201) {
    throw new Error(`User creation failed with status ${response.statusCode}: ${JSON.stringify(response.body)}`);
  }
  
  return response.body;
};

/**
 * Create a new user and get their auth token in one step
 * @param {Object} userData - User registration data
 * @returns {Promise<{user: Object, token: string}>} Created user and token
 */
const createUserAndGetToken = async (userData) => {
  const user = await createUser(userData);
  const token = await getAuthToken({
    email: userData.email,
    password: userData.password,
  });
  
  return { user, token };
};

/**
 * Make authenticated request with Bearer token
 * @param {Function} requestFn - Supertest request function
 * @param {string} token - JWT token
 * @returns {Object} Supertest request object with Authorization header set
 */
const authenticatedRequest = (requestFn, token) => {
  return requestFn.set("Authorization", `Bearer ${token}`);
};

module.exports = {
  getAuthToken,
  createUser,
  createUserAndGetToken,
  authenticatedRequest,
};
