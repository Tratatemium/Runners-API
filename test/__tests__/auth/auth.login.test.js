const request = require("supertest");
const app = require("../../../src/app.js");
const { TEST_USERS } = require("../../helpers/test-data");
const {
  expectErrorResponse,
  expectJsonResponse,
} = require("../../helpers/request.helpers");
const {
  expectValidJwtToken,
  expect400WithMessage,
  expect401Error,
} = require("../../helpers/assertions");

describe("POST /auth/login", () => {
  describe("Content-Type validation", () => {
    it("returns 415 when Content-Type is not JSON", async () => {
      const res = await request(app)
        .post("/auth/login")
        .set("Content-Type", "text/plain")
        .send("not json");

      expect(res.statusCode).toBe(415);
      expect400WithMessage(res, "Content-Type must be json.");
    });
    });
  });

  describe("Required fields validation", () => {
    it("returns 400 for empty JSON", async () => {
      const res = await request(app).post("/auth/login").send({});

      expect400WithMessage(res, "User data is missing required fields: password.");
    });

    it("returns 400 for missing password field", async () => {
      const res = await request(app)
        .post("/auth/login")
        .send({ username: TEST_USERS.user1.username });

      expect400WithMessage(res, "User data is missing required fields: password.");
    });

    it("returns 400 when both username and email are missing", async () => {
      const res = await request(app)
        .post("/auth/login")
        .send({ password: TEST_USERS.user1.password });

      expect400WithMessage(
        res,
        "User data must have one of the required fields: username, email."
      );
    });

    it("returns 400 when both username and email are provided", async () => {
      const res = await request(app).post("/auth/login").send({
        username: TEST_USERS.user1.username,
        email: TEST_USERS.user1.email,
        password: TEST_USERS.user1.password,
      });

      expect400WithMessage(res, "Provide either email or username, but not both.");
    });

    it.each([
      { field: "username", value: "" },
      { field: "email", value: "" },
      { field: "password", value: "" },
    ])("returns 400 for empty string $field", async ({ field, value }) => {
      const data = { [field]: value };
      if (field !== "password") data.password = TEST_USERS.user1.password;
      if (field !== "username" && field !== "email")
        data.username = TEST_USERS.user1.username;

      const res = await request(app).post("/auth/login").send(data);

      expectErrorResponse(res, 400);
    });
  });

  describe("Authentication validation", () => {
    it.each([
      { type: "username", identifier: TEST_USERS.user1.username },
      { type: "email", identifier: TEST_USERS.user1.email },
    ])(
      "returns 401 for incorrect password with $type",
      async ({ identifier, type }) => {
        const data = {
          [type]: identifier,
          password: "WrongPassword123!",
        };
        const res = await request(app).post("/auth/login").send(data);

        expect401Error(res);
      }
    );

    it.each([
      { type: "username", identifier: "nonexistent_user" },
      { type: "email", identifier: "nonexistent@example.com" },
    ])("returns 401 for non-existent $type", async ({ identifier, type }) => {
      const data = { [type]: identifier, password: "ValidPassword123!" };
      const res = await request(app).post("/auth/login").send(data);

      expect401Error(res);
    });
  });

  describe("Successful login", () => {
    it.each([
      {
        name: "with username",
        credentials: {
          username: TEST_USERS.user1.username,
          password: TEST_USERS.user1.password,
        },
      },
      {
        name: "with email",
        credentials: {
          email: TEST_USERS.user1.email,
          password: TEST_USERS.user1.password,
        },
      },
    ])("returns 200 and valid JWT token $name", async ({ credentials }) => {
      const res = await request(app).post("/auth/login").send(credentials);

      expectValidJwtToken(res);
    });

    it("allows multiple logins with same credentials", async () => {
      const loginData = {
        username: TEST_USERS.user1.username,
        password: TEST_USERS.user1.password,
      };

      const res1 = await request(app).post("/auth/login").send(loginData);
      const res2 = await request(app).post("/auth/login").send(loginData);

      expect(res1.statusCode).toBe(200);
      expect(res2.statusCode).toBe(200);
      expect(res1.body).toHaveProperty("token");
      expect(res2.body).toHaveProperty("token");
    });

    it("allows login with case-insensitive email", async () => {
      const email = TEST_USERS.user2.email.toLowerCase();
      const res = await request(app).post("/auth/login").send({
        email,
        password: TEST_USERS.user2.password,
      });

      expectValidJwtToken(res);
    });
  });
});
