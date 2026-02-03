/**
 * Shared test data for consistent test fixtures across all test files
 */

// Pre-seeded test users (must match fixture data)
const TEST_USERS = {
  user1: {
    username: "test_runner_01",
    password: "TestPassword123!",
    email: "runner01@test.com",
    userId: "f96084c5-ad81-4a19-99ef-49cfdfeb6fb5",
  },
  user2: {
    username: "test_runner_02",
    password: "SecurePass456!",
    email: "runner02@test.com",
    userId: "86642e8c-d288-450b-aa92-b83dc18abcaf",
  },
};

// Valid run data template
const VALID_RUN_DATA = {
  startTime: "2026-01-19T12:25:44.822Z",
  durationSec: 1800,
  distanceMeters: 5000,
};

// Pre-seeded run IDs (must match fixture data)
const TEST_RUN_IDS = {
  user1Run1: "dc9822e7-72d6-4cc8-b6da-c1c5208d6109",
  nonExistent: "dc9811e7-72d6-4df8-b6da-c1c5219d6109",
};

// Valid user registration data template
const VALID_USER_DATA = {
  username: "testuser123",
  password: "SecurePassword123!",
  email: "testuser@example.com",
};

// Common profile data template
const VALID_PROFILE_DATA = {
  firstName: "John",
  lastName: "Doe",
  dateOfBirth: "1990-05-15",
  heightCm: 180,
  weightKg: 75,
};

module.exports = {
  TEST_USERS,
  VALID_RUN_DATA,
  TEST_RUN_IDS,
  VALID_USER_DATA,
  VALID_PROFILE_DATA,
};
