const request = require("supertest");
const app = require("../../src/app.js");

// Using pre-seeded test users
const testUser1 = {
  username: "test_runner_01",
  password: "TestPassword123!",
  email: "runner01@test.com",
};

const testUser2 = {
  username: "test_runner_02",
  password: "SecurePass456!",
  email: "runner02@test.com",
};

describe("POST /users/login - Integration Tests", () => {
  describe("Content-Type validation", () => {
    it("returns 415 when Content-Type is not JSON", async () => {
      const res = await request(app)
        .post("/users/login")
        .set("Content-Type", "text/plain")
        .send("not json");

      expect(res.statusCode).toBe(415);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toBe("Content-Type must be json.");
    });
  });

  describe("Required fields validation", () => {
    it("returns 400 for empty JSON", async () => {
      const res = await request(app).post("/users/login").send({});

      expect(res.statusCode).toBe(400);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toBe(
        "User data is missing required fields: password.",
      );
    });

    it("returns 400 for missing password field", async () => {
      const res = await request(app)
        .post("/users/login")
        .send({ username: testUser1.username });

      expect(res.statusCode).toBe(400);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toBe(
        "User data is missing required fields: password.",
      );
    });

    it("returns 400 when both username and email are missing", async () => {
      const res = await request(app)
        .post("/users/login")
        .send({ password: testUser1.password });

      expect(res.statusCode).toBe(400);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toBe(
        "User data must have one of the required fields: username, email.",
      );
    });

    it("returns 400 when both username and email are provided", async () => {
      const res = await request(app)
        .post("/users/login")
        .send({
          username: testUser1.username,
          email: testUser1.email,
          password: testUser1.password,
        });

      expect(res.statusCode).toBe(400);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toBe(
        "Provide either email or username, but not both.",
      );
    });

    it("returns 400 for empty string username", async () => {
      const res = await request(app)
        .post("/users/login")
        .send({
          username: "",
          password: testUser1.password,
        });

      expect(res.statusCode).toBe(400);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
    });

    it("returns 400 for empty string email", async () => {
      const res = await request(app)
        .post("/users/login")
        .send({
          email: "",
          password: testUser1.password,
        });

      expect(res.statusCode).toBe(400);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
    });

    it("returns 400 for empty string password", async () => {
      const res = await request(app)
        .post("/users/login")
        .send({
          username: testUser1.username,
          password: "",
        });

      expect(res.statusCode).toBe(400);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
    });
  });

  describe("Authentication validation", () => {
    it("returns 401 for incorrect password with username", async () => {
      const res = await request(app).post("/users/login").send({
        username: testUser1.username,
        password: "WrongPassword123!",
      });

      expect(res.statusCode).toBe(401);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
    });

    it("returns 401 for incorrect password with email", async () => {
      const res = await request(app).post("/users/login").send({
        email: testUser1.email,
        password: "WrongPassword123!",
      });

      expect(res.statusCode).toBe(401);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
    });

    it("returns 401 for non-existent username", async () => {
      const res = await request(app).post("/users/login").send({
        username: "nonexistent_user",
        password: "ValidPassword123!",
      });

      expect(res.statusCode).toBe(401);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
    });

    it("returns 401 for non-existent email", async () => {
      const res = await request(app).post("/users/login").send({
        email: "nonexistent@example.com",
        password: "ValidPassword123!",
      });

      expect(res.statusCode).toBe(401);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
    });
  });

  describe("Successful login", () => {
    it("returns 200 and token for valid credentials with username", async () => {
      const res = await request(app).post("/users/login").send({
        username: testUser1.username,
        password: testUser1.password,
      });

      expect(res.statusCode).toBe(200);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("token");
      expect(typeof res.body.token).toBe("string");
      expect(res.body.token.length).toBeGreaterThan(0);
    });

    it("returns 200 and token for valid credentials with email", async () => {
      const res = await request(app).post("/users/login").send({
        email: testUser1.email,
        password: testUser1.password,
      });

      expect(res.statusCode).toBe(200);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("token");
      expect(typeof res.body.token).toBe("string");
      expect(res.body.token.length).toBeGreaterThan(0);
    });

    it("returns valid JWT token structure when logging in with username", async () => {
      const res = await request(app).post("/users/login").send({
        username: testUser2.username,
        password: testUser2.password,
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.token).toMatch(
        /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/,
      );
    });

    it("returns valid JWT token structure when logging in with email", async () => {
      const res = await request(app).post("/users/login").send({
        email: testUser2.email,
        password: testUser2.password,
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.token).toMatch(
        /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/,
      );
    });

    it("allows multiple logins with same credentials using username", async () => {
      const loginData = {
        username: testUser1.username,
        password: testUser1.password,
      };
      const res1 = await request(app).post("/users/login").send(loginData);
      const res2 = await request(app).post("/users/login").send(loginData);

      expect(res1.statusCode).toBe(200);
      expect(res2.statusCode).toBe(200);
      expect(res1.body).toHaveProperty("token");
      expect(res2.body).toHaveProperty("token");
    });

    it("allows multiple logins with same credentials using email", async () => {
      const loginData = {
        email: testUser1.email,
        password: testUser1.password,
      };
      const res1 = await request(app).post("/users/login").send(loginData);
      const res2 = await request(app).post("/users/login").send(loginData);

      expect(res1.statusCode).toBe(200);
      expect(res2.statusCode).toBe(200);
      expect(res1.body).toHaveProperty("token");
      expect(res2.body).toHaveProperty("token");
    });

    it("allows login with email in different case (case-insensitive)", async () => {
      const res = await request(app).post("/users/login").send({
        email: testUser1.email.toUpperCase(),
        password: testUser1.password,
      });

      expect(res.statusCode).toBe(200);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("token");
      expect(typeof res.body.token).toBe("string");
      expect(res.body.token.length).toBeGreaterThan(0);
    });

    it("allows login with mixed case email", async () => {
      const mixedCaseEmail = "RuNnEr02@TeSt.CoM";
      const res = await request(app).post("/users/login").send({
        email: mixedCaseEmail,
        password: testUser2.password,
      });

      expect(res.statusCode).toBe(200);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("token");
    });
  });
});

describe("GET /users/me - Integration Tests", () => {
  let user1Token;
  let user2Token;

  beforeAll(async () => {
    // Login as user1 and get token
    const loginRes1 = await request(app).post("/users/login").send({
      email: testUser1.email,
      password: testUser1.password,
    });
    user1Token = loginRes1.body.token;

    // Login as user2 and get token
    const loginRes2 = await request(app).post("/users/login").send({
      email: testUser2.email,
      password: testUser2.password,
    });
    user2Token = loginRes2.body.token;
  });

  describe("Authentication validation", () => {
    it("returns 401 when no authorization header is provided", async () => {
      const res = await request(app).get("/users/me");

      expect(res.statusCode).toBe(401);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toBe("Invalid authorization header.");
    });

    it("returns 401 when authorization header doesn't start with Bearer", async () => {
      const res = await request(app)
        .get("/users/me")
        .set("Authorization", "InvalidFormat");

      expect(res.statusCode).toBe(401);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toBe("Invalid authorization header.");
    });

    it("returns 401 for invalid token", async () => {
      const res = await request(app)
        .get("/users/me")
        .set("Authorization", "Bearer invalid.token.here");

      expect(res.statusCode).toBe(401);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
    });
  });

  describe("Successful requests", () => {
    it("returns 200 and user data for authenticated user", async () => {
      const res = await request(app)
        .get("/users/me")
        .set("Authorization", `Bearer ${user1Token}`);

      expect(res.statusCode).toBe(200);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("account");
      expect(res.body).toHaveProperty("profile");
      expect(res.body).not.toHaveProperty("_id");
      expect(res.body).not.toHaveProperty("credentials");
      expect(res.body.account).toHaveProperty("username", testUser1.username);
      expect(res.body.account).toHaveProperty("email", testUser1.email);
    });

    it("returns correct data for different authenticated users", async () => {
      const res = await request(app)
        .get("/users/me")
        .set("Authorization", `Bearer ${user2Token}`);

      expect(res.statusCode).toBe(200);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("account");
      expect(res.body.account).toHaveProperty("username", testUser2.username);
      expect(res.body.account).toHaveProperty("email", testUser2.email);
    });
  });
});
