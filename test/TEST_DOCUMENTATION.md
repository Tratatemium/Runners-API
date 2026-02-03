# Test Suite Documentation

## Overview

This test suite uses Jest and Supertest to perform integration testing of the Runners API. The tests are organized by feature/domain for better maintainability and clarity.

## Test Structure

```
test/
├── __tests__/
│   ├── auth/               # Authentication & authorization tests
│   │   ├── auth.login.test.js       # Login endpoint tests
│   │   ├── auth.signup.test.js      # User registration tests
│   │   └── auth.session.test.js     # Session management (logout, GET /users/me)
│   ├── users/              # User management tests
│   │   ├── users.profile.test.js    # Profile update tests (PATCH /users/me/profile)
│   │   └── users.account.test.js    # Account updates (password, email, username)
│   ├── runs/               # Run management tests
│   │   ├── runs.create.test.js      # Create and list runs
│   │   ├── runs.read.test.js        # Read single run
│   │   └── runs.delete.test.js      # Delete runs
│   └── server/             # Server health checks
│       └── health.test.js           # Health and runtime endpoints
├── helpers/                # Shared test utilities
│   ├── auth.helpers.js              # Authentication utilities (login, tokens)
│   ├── test-data.js                 # Shared test data and fixtures
│   ├── request.helpers.js           # Common request patterns
│   ├── assertions.js                # Custom assertion helpers
│   └── seeding.js                   # Database seeding utilities
├── fixtures/               # Test data fixtures
│   ├── users.fixture.json
│   └── runs.fixture.json
└── setup/                  # Test setup and configuration
    ├── jest.setup.js                # Jest configuration
    └── testDB.setup.js              # Database setup
```

## Helper Functions

### auth.helpers.js
- `getAuthToken(credentials)` - Login and retrieve JWT token
- `createUser(userData)` - Create new user via signup
- `createUserAndGetToken(userData)` - Create user and get token in one step
- `authenticatedRequest(requestFn, token)` - Make authenticated request

### test-data.js
- `TEST_USERS` - Pre-seeded test users with credentials
- `VALID_RUN_DATA` - Valid run data template
- `TEST_RUN_IDS` - Pre-seeded run IDs
- `VALID_USER_DATA` - Valid user registration template
- `VALID_PROFILE_DATA` - Valid profile data template

### request.helpers.js
- `expectErrorResponse(response, status)` - Assert error response structure
- `expectJsonResponse(response, status)` - Assert JSON response
- `getAuthValidationTests()` - Common authentication test cases
- `getContentTypeTests()` - Common Content-Type test cases
- `getMissingFieldTests(data, fields)` - Generate missing field tests

### assertions.js
- `expectValidJwtToken(response)` - Assert valid JWT structure
- `expectValidRunStructure(run)` - Assert run object structure
- `expectValidUserStructure(user, expected)` - Assert user object structure
- `expect400WithMessage(response, message)` - Assert 400 error with message
- `expect401Error(response)` - Assert 401 error
- `expect403Error(response)` - Assert 403 error
- `expect404Error(response)` - Assert 404 error

## Test Naming Conventions

### File Naming
- Format: `<domain>.<feature>.test.js`
- Examples: `auth.login.test.js`, `runs.create.test.js`

### Test Case Naming
- Descriptive and action-oriented
- Format: "returns {status} for/when {condition}"
- Examples:
  - "returns 200 and valid JWT token with username"
  - "returns 400 for missing password field"
  - "returns 403 when user tries to delete another user's run"

### Describe Block Organization
- Top level: HTTP method + endpoint (e.g., "POST /auth/login")
- Second level: Feature or validation type (e.g., "Authentication validation")
- Third level (optional): Specific scenarios

## Test Patterns

### Using Data-Driven Tests
```javascript
it.each([
  { value: "short", message: "Username must be between 6 and 30 characters long." },
  { value: "a".repeat(31), message: "Username must be between 6 and 30 characters long." },
])("returns 400 for invalid username: $value", async ({ value, message }) => {
  const res = await request(app)
    .post("/auth/signup")
    .send({ ...VALID_USER_DATA, username: value });

  expect400WithMessage(res, message);
});
```

### Using Helper Patterns
```javascript
describe("Authentication validation", () => {
  getAuthValidationTests().forEach(({ name, setupAuth }) => {
    it(name, async () => {
      const req = request(app).post("/users/me/runs").send(VALID_RUN_DATA);
      const res = await setupAuth(req);

      expect401Error(res);
    });
  });
});
```

### Token Management
```javascript
let userToken;

beforeAll(async () => {
  userToken = await getAuthToken({
    email: TEST_USERS.user1.email,
    password: TEST_USERS.user1.password,
  });
});

it("makes authenticated request", async () => {
  const res = await request(app)
    .get("/users/me")
    .set("Authorization", `Bearer ${userToken}`);
  
  expect(res.statusCode).toBe(200);
});
```

## Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- auth.login.test

# Run tests in specific directory
npm test -- __tests__/auth

# Run tests in watch mode
npm test -- --watch

# Run with coverage
npm test -- --coverage
```

## Test Coverage

The test suite covers:
- ✅ Authentication & authorization
- ✅ Input validation (required fields, data types, formats)
- ✅ Business logic validation
- ✅ Permission checks
- ✅ Error handling
- ✅ Success scenarios
- ✅ Edge cases (empty arrays, concurrent requests, etc.)

## Benefits of New Structure

1. **Better Organization**: Tests grouped by domain/feature, not by file size
2. **Reduced Duplication**: Shared helpers eliminate repetitive code
3. **Improved Readability**: Clear naming and consistent patterns
4. **Easier Maintenance**: Changes to common patterns affect one place
5. **Faster Development**: Reusable utilities speed up writing new tests
6. **Better Coverage Tracking**: Domain-based organization shows gaps clearly
7. **Scalability**: Easy to add new test files following established patterns

## Migration Notes

The old test files have been refactored into this new structure:
- `users.auth.tests.js` → `auth/auth.login.test.js`, `auth/auth.session.test.js`
- `users.register.tests.js` → `auth/auth.signup.test.js`
- `users.patch.tests.js` → `users/users.profile.test.js`
- `users.patch.account.tests.js` → `users/users.account.test.js`
- `runs.tests.js` → `runs/runs.create.test.js`, `runs/runs.read.test.js`, `runs/runs.delete.test.js`
- `server.tests.js` → `server/health.test.js`

All functionality has been preserved with improved organization and reduced duplication.
