const request = require("supertest");
const app = require("../../src/app.js");

describe("POST /users/login - Integration Tests", () => {
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
        "User data is missing required fields: username, password, email.",
      );
    });

    it("returns 400 for missing username field", async () => {
      const { username, ...dataWithoutUsername } = testUser1;
      const res = await request(app).post("/users/login").send(dataWithoutUsername);

      expect(res.statusCode).toBe(400);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toBe(
        "User data is missing required fields: username.",
      );
    });

    it("returns 400 for missing password field", async () => {
      const { password, ...dataWithoutPassword } = testUser1;
      const res = await request(app).post("/users/login").send(dataWithoutPassword);

      expect(res.statusCode).toBe(400);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toBe(
        "User data is missing required fields: password.",
      );
    });

    it("returns 400 for missing email field", async () => {
      const { email, ...dataWithoutEmail } = testUser1;
      const res = await request(app).post("/users/login").send(dataWithoutEmail);

      expect(res.statusCode).toBe(400);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toBe(
        "User data is missing required fields: email.",
      );
    });
  });

  describe("Authentication validation", () => {
    it("returns 401 for incorrect password", async () => {
      const res = await request(app)
        .post("/users/login")
        .send({
          username: testUser1.username,
          email: testUser1.email,
          password: "WrongPassword123!",
        });

      expect(res.statusCode).toBe(401);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
    });

    it("returns 401 for non-existent email", async () => {
      const res = await request(app)
        .post("/users/login")
        .send({
          username: "validuser123",
          email: "nonexistent@example.com",
          password: "ValidPassword123!",
        });

      expect(res.statusCode).toBe(401);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
    });
  });

  describe("Successful login", () => {
    it("returns 200 and token for valid credentials", async () => {
      const res = await request(app).post("/users/login").send(testUser1);

      expect(res.statusCode).toBe(200);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("token");
      expect(typeof res.body.token).toBe("string");
      expect(res.body.token.length).toBeGreaterThan(0);
    });

    it("returns valid JWT token structure", async () => {
      const res = await request(app).post("/users/login").send(testUser2);

      expect(res.statusCode).toBe(200);
      expect(res.body.token).toMatch(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/);
    });

    it("allows multiple logins with same credentials", async () => {
      const res1 = await request(app).post("/users/login").send(testUser1);
      const res2 = await request(app).post("/users/login").send(testUser1);

      expect(res1.statusCode).toBe(200);
      expect(res2.statusCode).toBe(200);
      expect(res1.body).toHaveProperty("token");
      expect(res2.body).toHaveProperty("token");
    });
  });
});

describe("GET /users/:id - Integration Tests", () => {
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

  let user1Token;
  let user1Id;
  let user2Token;
  let user2Id;

  beforeAll(async () => {
    // Login as user1 and get token
    const loginRes1 = await request(app).post("/users/login").send(testUser1);
    user1Token = loginRes1.body.token;

    // Login as user2 and get token
    const loginRes2 = await request(app).post("/users/login").send(testUser2);
    user2Token = loginRes2.body.token;

    // Extract user IDs from tokens (tokens contain userId)
    const user1Data = JSON.parse(Buffer.from(user1Token.split('.')[1], 'base64').toString());
    user1Id = user1Data.userId;

    const user2Data = JSON.parse(Buffer.from(user2Token.split('.')[1], 'base64').toString());
    user2Id = user2Data.userId;
  });

  describe("Authentication validation", () => {
    it("returns 401 when no authorization header is provided", async () => {
      const res = await request(app).get(`/users/${user1Id}`);

      expect(res.statusCode).toBe(401);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toBe("Invalid authorization header.");
    });

    it("returns 401 when authorization header is malformed", async () => {
      const res = await request(app)
        .get(`/users/${user1Id}`)
        .set("Authorization", "InvalidFormat");

      expect(res.statusCode).toBe(401);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toBe("Invalid authorization header.");
    });

    it("returns 401 when authorization header doesn't start with Bearer", async () => {
      const res = await request(app)
        .get(`/users/${user1Id}`)
        .set("Authorization", `Token ${user1Token}`);

      expect(res.statusCode).toBe(401);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toBe("Invalid authorization header.");
    });

    it("returns 401 for invalid token", async () => {
      const res = await request(app)
        .get(`/users/${user1Id}`)
        .set("Authorization", "Bearer invalid.token.here");

      expect(res.statusCode).toBe(401);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
    });

    it("returns 401 for expired or malformed token", async () => {
      const fakeToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjM0NSJ9.invalid";
      const res = await request(app)
        .get(`/users/${user1Id}`)
        .set("Authorization", `Bearer ${fakeToken}`);

      expect(res.statusCode).toBe(401);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
    });
  });

  describe("UUID validation", () => {
    it("returns 400 for invalid UUID format", async () => {
      const res = await request(app)
        .get("/users/not-a-uuid")
        .set("Authorization", `Bearer ${user1Token}`);

      expect(res.statusCode).toBe(400);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
    });

    it("returns 400 for numeric ID instead of UUID", async () => {
      const res = await request(app)
        .get("/users/12345")
        .set("Authorization", `Bearer ${user1Token}`);

      expect(res.statusCode).toBe(400);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
    });
  });

  describe("Ownership validation", () => {
    it("returns 403 when user tries to access another user's data", async () => {
      const res = await request(app)
        .get(`/users/${user2Id}`)
        .set("Authorization", `Bearer ${user1Token}`);

      expect(res.statusCode).toBe(403);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toBe("You are not allowed to perform this action.");
    });

    it("returns 403 when user2 tries to access user1's data", async () => {
      const res = await request(app)
        .get(`/users/${user1Id}`)
        .set("Authorization", `Bearer ${user2Token}`);

      expect(res.statusCode).toBe(403);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toBe("You are not allowed to perform this action.");
    });
  });

  describe("Successful requests", () => {
    it("returns 200 and user data when accessing own profile", async () => {
      const res = await request(app)
        .get(`/users/${user1Id}`)
        .set("Authorization", `Bearer ${user1Token}`);

      expect(res.statusCode).toBe(200);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("account");
      expect(res.body.account).toHaveProperty("username", testUser1.username);
      expect(res.body.account).toHaveProperty("email", testUser1.email);
    });

    it("returns user data without sensitive fields", async () => {
      const res = await request(app)
        .get(`/users/${user1Id}`)
        .set("Authorization", `Bearer ${user1Token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).not.toHaveProperty("_id");
      expect(res.body).not.toHaveProperty("credentials");
      expect(res.body).toHaveProperty("account");
      expect(res.body).toHaveProperty("profile");
    });

    it("allows user2 to access their own profile", async () => {
      const res = await request(app)
        .get(`/users/${user2Id}`)
        .set("Authorization", `Bearer ${user2Token}`);

      expect(res.statusCode).toBe(200);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body.account).toHaveProperty("username", testUser2.username);
      expect(res.body.account).toHaveProperty("email", testUser2.email);
    });
  });
});