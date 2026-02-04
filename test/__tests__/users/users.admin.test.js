const request = require("supertest");
const app = require("../../../src/app.js");
const { TEST_USERS } = require("../../helpers/test-data");
const { getAuthToken } = require("../../helpers/auth.helpers");
const {
  expectValidUserStructure,
  expect401Error,
  expect403Error,
  expect400WithMessage,
  expect404Error,
  expectJsonResponse,
} = require("../../helpers/assertions");
const { getAuthValidationTests } = require("../../helpers/request.helpers");

describe("GET /api/v1/users/:id (Admin Route)", () => {
  let user1Token;
  let user2Token;
  let adminToken;

  beforeAll(async () => {
    user1Token = await getAuthToken({
      email: TEST_USERS.user1.email,
      password: TEST_USERS.user1.password,
    });
    user2Token = await getAuthToken({
      email: TEST_USERS.user2.email,
      password: TEST_USERS.user2.password,
    });
    adminToken = await getAuthToken({
      email: TEST_USERS.admin.email,
      password: TEST_USERS.admin.password,
    });
  });

  describe("Authentication validation", () => {
    getAuthValidationTests().forEach(({ name, setupAuth }) => {
      it(name, async () => {
        const req = request(app).get(
          `/api/v1/users/${TEST_USERS.user1.userId}`,
        );
        const res = await setupAuth(req);

        expect401Error(res);
      });
    });
  });

  describe("UUID validation", () => {
    const invalidUUIDs = [
      { id: "not-a-uuid", desc: "invalid format" },
      { id: "123", desc: "too short" },
      { id: "f96084c5-ad81-4a19-99ef", desc: "incomplete UUID" },
      {
        id: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
        desc: "invalid characters",
      },
    ];

    invalidUUIDs.forEach(({ id, desc }) => {
      it(`returns 400 when id is ${desc}`, async () => {
        const res = await request(app)
          .get(`/api/v1/users/${id}`)
          .set("Authorization", `Bearer ${adminToken}`);

        expect400WithMessage(res, /id.*valid UUID/i);
      });
    });
  });

  describe("Authorization/Permission checks", () => {
    it("allows admin to access any user's data", async () => {
      const res = await request(app)
        .get(`/api/v1/users/${TEST_USERS.user1.userId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expectJsonResponse(res, 200);
      expectValidUserStructure(res.body.data, {
        username: TEST_USERS.user1.username,
        email: TEST_USERS.user1.email,
      });
    });

    it("allows user to access their own data", async () => {
      const res = await request(app)
        .get(`/api/v1/users/${TEST_USERS.user1.userId}`)
        .set("Authorization", `Bearer ${user1Token}`);

      expectJsonResponse(res, 200);
      expectValidUserStructure(res.body.data, {
        username: TEST_USERS.user1.username,
        email: TEST_USERS.user1.email,
      });
    });

    it("denies user access to another user's data", async () => {
      const res = await request(app)
        .get(`/api/v1/users/${TEST_USERS.user2.userId}`)
        .set("Authorization", `Bearer ${user1Token}`);

      expect403Error(res);
      expect(res.body.error).toMatch(/not allowed/i);
    });
  });

  describe("Successful user retrieval", () => {
    it("returns complete user data for user1", async () => {
      const res = await request(app)
        .get(`/api/v1/users/${TEST_USERS.user1.userId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expectJsonResponse(res, 200);
      expectValidUserStructure(res.body.data, {
        username: TEST_USERS.user1.username,
        email: TEST_USERS.user1.email,
      });
    });

    it("returns complete user data for user2", async () => {
      const res = await request(app)
        .get(`/api/v1/users/${TEST_USERS.user2.userId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expectJsonResponse(res, 200);
      expectValidUserStructure(res.body.data, {
        username: TEST_USERS.user2.username,
        email: TEST_USERS.user2.email,
      });
    });

    it("returns admin user data when admin requests their own data", async () => {
      const res = await request(app)
        .get(`/api/v1/users/${TEST_USERS.admin.userId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expectJsonResponse(res, 200);
      expectValidUserStructure(res.body.data, {
        username: TEST_USERS.admin.username,
        email: TEST_USERS.admin.email,
      });
    });

    it("does not expose sensitive credentials in response", async () => {
      const res = await request(app)
        .get(`/api/v1/users/${TEST_USERS.user1.userId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expectJsonResponse(res, 200);
      expect(res.body).not.toHaveProperty("credentials");
      expect(res.body).not.toHaveProperty("auth");
    });
  });

  describe("Non-existent user", () => {
    it("returns 404 for non-existent user ID", async () => {
      const nonExistentId = "e970bb08-3470-41de-be0b-753df9ec6562";
      const res = await request(app)
        .get(`/api/v1/users/${nonExistentId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect404Error(res);
      expect(res.body.error).toMatch(/No user.*found/i);
    });
  });
});

describe("GET /api/v1/users/ (Admin - Get All Users)", () => {
  let user1Token;
  let user2Token;
  let adminToken;

  beforeAll(async () => {
    user1Token = await getAuthToken({
      email: TEST_USERS.user1.email,
      password: TEST_USERS.user1.password,
    });
    user2Token = await getAuthToken({
      email: TEST_USERS.user2.email,
      password: TEST_USERS.user2.password,
    });
    adminToken = await getAuthToken({
      email: TEST_USERS.admin.email,
      password: TEST_USERS.admin.password,
    });
  });

  describe("Authentication validation", () => {
    getAuthValidationTests().forEach(({ name, setupAuth }) => {
      it(name, async () => {
        const req = request(app).get("/api/v1/users/");
        const res = await setupAuth(req);

        expect401Error(res);
      });
    });
  });

  describe("Authorization/Permission checks", () => {
    it("denies access to regular users", async () => {
      const res = await request(app)
        .get("/api/v1/users/")
        .set("Authorization", `Bearer ${user1Token}`);

      expect403Error(res);
      expect(res.body.error).toMatch(/not allowed|permission|admin/i);
    });

    it("denies access to different regular users", async () => {
      const res = await request(app)
        .get("/api/v1/users/")
        .set("Authorization", `Bearer ${user2Token}`);

      expect403Error(res);
    });
  });

  describe("Successful user list retrieval", () => {
    it("allows admin to retrieve all users", async () => {
      const res = await request(app)
        .get("/api/v1/users/")
        .set("Authorization", `Bearer ${adminToken}`);

      expectJsonResponse(res, 200);
      expect(res.body).toHaveProperty("status", "success");
      expect(res.body).toHaveProperty("results");
      expect(res.body).toHaveProperty("data");
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it("returns multiple users in the list", async () => {
      const res = await request(app)
        .get("/api/v1/users/")
        .set("Authorization", `Bearer ${adminToken}`);

      expectJsonResponse(res, 200);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.results).toBe(res.body.data.length);
    });

    it("returns users with valid structure", async () => {
      const res = await request(app)
        .get("/api/v1/users/")
        .set("Authorization", `Bearer ${adminToken}`);

      expectJsonResponse(res, 200);
      expect(res.body.data.length).toBeGreaterThan(0);

      res.body.data.forEach((user) => {
        expect(user).toHaveProperty("account");
        expect(user).toHaveProperty("profile");
        expect(user.account).toHaveProperty("username");
        expect(user.account).toHaveProperty("email");
      });
    });

    it("does not expose sensitive credentials in any user", async () => {
      const res = await request(app)
        .get("/api/v1/users/")
        .set("Authorization", `Bearer ${adminToken}`);

      expectJsonResponse(res, 200);

      res.body.data.forEach((user) => {
        expect(user).not.toHaveProperty("credentials");
        expect(user).not.toHaveProperty("auth");
        expect(user).not.toHaveProperty("_id");
      });
    });

    it("includes test users in the response", async () => {
      const res = await request(app)
        .get("/api/v1/users/")
        .set("Authorization", `Bearer ${adminToken}`);

      expectJsonResponse(res, 200);

      const usernames = res.body.data.map((u) => u.account.username);
      expect(usernames).toContain(TEST_USERS.user1.username);
      expect(usernames).toContain(TEST_USERS.user2.username);
      expect(usernames).toContain(TEST_USERS.admin.username);
    });
  });
});
