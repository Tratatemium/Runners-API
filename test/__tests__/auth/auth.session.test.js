const request = require("supertest");
const app = require("../../../src/app.js");
const { TEST_USERS } = require("../../helpers/test-data");
const { getAuthToken } = require("../../helpers/auth.helpers");
const {
  expectValidUserStructure,
  expect401Error,
  expectJsonResponse,
} = require("../../helpers/assertions");
const { getAuthValidationTests } = require("../../helpers/request.helpers");

describe("GET /api/v1/users/me", () => {
  let user1Token;
  let user2Token;

  beforeAll(async () => {
    user1Token = await getAuthToken({
      email: TEST_USERS.user1.email,
      password: TEST_USERS.user1.password,
    });
    user2Token = await getAuthToken({
      email: TEST_USERS.user2.email,
      password: TEST_USERS.user2.password,
    });
  });

  describe("Authentication validation", () => {
    getAuthValidationTests().forEach(({ name, setupAuth }) => {
      it(name, async () => {
        const req = request(app).get("/api/v1/users/me");
        const res = await setupAuth(req);

        expect401Error(res);
      });
    });
  });

  describe("Successful requests", () => {
    it("returns 200 and user data for authenticated user", async () => {
      const res = await request(app)
        .get("/api/v1/users/me")
        .set("Authorization", `Bearer ${user1Token}`);

      expectJsonResponse(res, 200);
      expectValidUserStructure(res.body.data, {
        username: TEST_USERS.user1.username,
        email: TEST_USERS.user1.email,
      });
    });

    it("returns correct data for different authenticated users", async () => {
      const res = await request(app)
        .get("/api/v1/users/me")
        .set("Authorization", `Bearer ${user2Token}`);

      expectJsonResponse(res, 200);
      expectValidUserStructure(res.body.data, {
        username: TEST_USERS.user2.username,
        email: TEST_USERS.user2.email,
      });
    });
  });
});

describe("POST /api/v1/auth/logoutAll", () => {
  describe("Authentication validation", () => {
    getAuthValidationTests().forEach(({ name, setupAuth }) => {
      it(name, async () => {
        const req = request(app).post("/api/v1/auth/logoutAll");
        const res = await setupAuth(req);

        expect401Error(res);
      });
    });
  });

  describe("Successful logout", () => {
    it("returns 200 when logging out all sessions", async () => {
      const token = await getAuthToken({
        email: TEST_USERS.user1.email,
        password: TEST_USERS.user1.password,
      });

      const res = await request(app)
        .post("/api/v1/auth/logoutAll")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
    });

    it("invalidates all previous tokens after logoutAll", async () => {
      const token = await getAuthToken({
        email: TEST_USERS.user1.email,
        password: TEST_USERS.user1.password,
      });

      // Verify token works
      const beforeLogout = await request(app)
        .get("/api/v1/users/me")
        .set("Authorization", `Bearer ${token}`);
      expect(beforeLogout.statusCode).toBe(200);

      // Logout all sessions
      await request(app)
        .post("/api/v1/auth/logoutAll")
        .set("Authorization", `Bearer ${token}`);

      // Try to use old token
      const afterLogout = await request(app)
        .get("/api/v1/users/me")
        .set("Authorization", `Bearer ${token}`);

      expect401Error(afterLogout);
    });

    it("invalidates multiple tokens after logoutAll", async () => {
      // Login twice to get two tokens
      const token1 = await getAuthToken({
        email: TEST_USERS.user1.email,
        password: TEST_USERS.user1.password,
      });
      const token2 = await getAuthToken({
        email: TEST_USERS.user1.email,
        password: TEST_USERS.user1.password,
      });

      // Verify both tokens work
      const check1 = await request(app)
        .get("/api/v1/users/me")
        .set("Authorization", `Bearer ${token1}`);
      expect(check1.statusCode).toBe(200);

      const check2 = await request(app)
        .get("/api/v1/users/me")
        .set("Authorization", `Bearer ${token2}`);
      expect(check2.statusCode).toBe(200);

      // Logout all sessions using first token
      await request(app)
        .post("/api/v1/auth/logoutAll")
        .set("Authorization", `Bearer ${token1}`);

      // Both tokens should now be invalid
      const afterLogout1 = await request(app)
        .get("/api/v1/users/me")
        .set("Authorization", `Bearer ${token1}`);
      expect401Error(afterLogout1);

      const afterLogout2 = await request(app)
        .get("/api/v1/users/me")
        .set("Authorization", `Bearer ${token2}`);
      expect401Error(afterLogout2);
    });

    it("allows login with new token after logoutAll", async () => {
      // Login and logout all
      const oldToken = await getAuthToken({
        email: TEST_USERS.user1.email,
        password: TEST_USERS.user1.password,
      });

      await request(app)
        .post("/api/v1/auth/logoutAll")
        .set("Authorization", `Bearer ${oldToken}`);

      // Login again to get new token
      const newToken = await getAuthToken({
        email: TEST_USERS.user1.email,
        password: TEST_USERS.user1.password,
      });

      // Use new token to access protected endpoint
      const res = await request(app)
        .get("/api/v1/users/me")
        .set("Authorization", `Bearer ${newToken}`);

      expectJsonResponse(res, 200);
      expect(res.body.data).toHaveProperty("account");
    });
  });
});
