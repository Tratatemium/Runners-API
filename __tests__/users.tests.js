const request = require("supertest");
const app = require("../src/app.js");
const { connectDB } = require("../src/database.js");

beforeAll(async () => {
  await connectDB();
});

describe("POST /users/ - Integration Tests", () => {
  const validUserData = {
    username: "testuser123",
    password: "SecurePassword123!",
    email: "testuser@example.com",
  };

  it("returns 415 when Content-Type is not JSON", async () => {
    const res = await request(app)
      .post("/users")
      .set("Content-Type", "text/plain")
      .send("not json");

    expect(res.statusCode).toBe(415);
    expect(res.headers["content-type"]).toMatch(/json/);
    expect(res.body).toHaveProperty("error");
    expect(res.body.error).toBe("Content-Type must be json.");
  });

  describe("Required fields validation", () => {
    it("returns 400 for empty JSON", async () => {
      const res = await request(app).post("/users/").send({});

      expect(res.statusCode).toBe(400);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toBe(
        "User data is missing required fields: username, password, email.",
      );
    });

    it("returns 400 for missing username field", async () => {
      const { username, ...dataWithoutUsername } = validUserData;
      const res = await request(app).post("/users/").send(dataWithoutUsername);

      expect(res.statusCode).toBe(400);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toBe(
        "User data is missing required fields: username.",
      );
    });

    it("returns 400 for missing password field", async () => {
      const { password, ...dataWithoutPassword } = validUserData;
      const res = await request(app).post("/users/").send(dataWithoutPassword);

      expect(res.statusCode).toBe(400);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toBe(
        "User data is missing required fields: password.",
      );
    });

    it("returns 400 for missing email field", async () => {
      const { email, ...dataWithoutEmail } = validUserData;
      const res = await request(app).post("/users/").send(dataWithoutEmail);

      expect(res.statusCode).toBe(400);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toBe(
        "User data is missing required fields: email.",
      );
    });

    it("returns 400 when field is null", async () => {
      const res = await request(app)
        .post("/users")
        .send({ ...validUserData, username: null });

      expect(res.statusCode).toBe(400);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toContain("username");
    });
  });

  describe("username validation", () => {
    it("returns 400 for non-string username", async () => {
      const res = await request(app)
        .post("/users")
        .send({ ...validUserData, username: 12345 });

      expect(res.statusCode).toBe(400);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toBe("Username must be a string.");
    });

    it("returns 400 for username shorter than 6 characters", async () => {
      const res = await request(app)
        .post("/users")
        .send({ ...validUserData, username: "short" });

      expect(res.statusCode).toBe(400);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toBe(
        "Username must be between 6 and 30 characters long.",
      );
    });

    it("returns 400 for username longer than 30 characters", async () => {
      const res = await request(app)
        .post("/users")
        .send({ ...validUserData, username: "a".repeat(31) });

      expect(res.statusCode).toBe(400);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toBe(
        "Username must be between 6 and 30 characters long.",
      );
    });

    it("returns 400 for username with special characters", async () => {
      const res = await request(app)
        .post("/users")
        .send({ ...validUserData, username: "user@name!" });

      expect(res.statusCode).toBe(400);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toBe(
        "Username may only contain letters, numbers, and underscores.",
      );
    });

    it("returns 400 for username with spaces", async () => {
      const res = await request(app)
        .post("/users")
        .send({ ...validUserData, username: "user name" });

      expect(res.statusCode).toBe(400);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toBe(
        "Username may only contain letters, numbers, and underscores.",
      );
    });

    it("accepts valid username with letters, numbers, and underscores", async () => {
      const res = await request(app)
        .post("/users")
        .send({ ...validUserData, username: "valid_user123" });

      expect(res.statusCode).toBe(201);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("id");
    });

    it("accepts username exactly 6 characters long", async () => {
      const res = await request(app)
        .post("/users")
        .send({ ...validUserData, username: "user12" });

      expect(res.statusCode).toBe(201);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("id");
    });

    it("accepts username exactly 30 characters long", async () => {
      const res = await request(app)
        .post("/users")
        .send({ ...validUserData, username: "a".repeat(30) });

      expect(res.statusCode).toBe(201);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("id");
    });
  });

  describe("email validation", () => {
    it("returns 400 for non-string email", async () => {
      const res = await request(app)
        .post("/users")
        .send({ ...validUserData, email: 12345 });

      expect(res.statusCode).toBe(400);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toBe("Email must be a string.");
    });

    it("returns 400 for email longer than 254 characters", async () => {
      const longEmail = "a".repeat(250) + "@test.com";
      const res = await request(app)
        .post("/users")
        .send({ ...validUserData, email: longEmail });

      expect(res.statusCode).toBe(400);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toBe("Email is too long.");
    });

    it("returns 400 for email with whitespace", async () => {
      const res = await request(app)
        .post("/users")
        .send({ ...validUserData, email: "test user@example.com" });

      expect(res.statusCode).toBe(400);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toBe("Email must not contain whitespace.");
    });

    it("returns 400 for invalid email format without @", async () => {
      const res = await request(app)
        .post("/users")
        .send({ ...validUserData, email: "invalidemail.com" });

      expect(res.statusCode).toBe(400);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toBe("Email must be a valid email address.");
    });

    it("returns 400 for invalid email format without domain", async () => {
      const res = await request(app)
        .post("/users")
        .send({ ...validUserData, email: "invalid@" });

      expect(res.statusCode).toBe(400);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toBe("Email must be a valid email address.");
    });

    it("returns 400 for empty email", async () => {
      const res = await request(app)
        .post("/users")
        .send({ ...validUserData, email: "" });

      expect(res.statusCode).toBe(400);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toBe("Email must be a valid email address.");
    });

    it("accepts valid email address", async () => {
      const res = await request(app)
        .post("/users")
        .send({ ...validUserData, email: "valid.email@example.com" });

      expect(res.statusCode).toBe(201);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("id");
    });

    it("accepts email with subdomain", async () => {
      const res = await request(app)
        .post("/users")
        .send({ ...validUserData, email: "user@mail.example.com" });

      expect(res.statusCode).toBe(201);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("id");
    });
  });

  describe("password validation", () => {
    it("returns 400 for non-string password", async () => {
      const res = await request(app)
        .post("/users")
        .send({ ...validUserData, password: 12345 });

      expect(res.statusCode).toBe(400);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toBe("Password must be a string.");
    });

    it("returns 400 for password shorter than 12 characters", async () => {
      const res = await request(app)
        .post("/users")
        .send({ ...validUserData, password: "Short1!" });

      expect(res.statusCode).toBe(400);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toBe(
        "Password must be at least 12 characters long.",
      );
    });

    it("returns 400 for password longer than 128 characters", async () => {
      const res = await request(app)
        .post("/users")
        .send({ ...validUserData, password: "a".repeat(129) });

      expect(res.statusCode).toBe(400);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toBe(
        "Password must be at most 128 characters long.",
      );
    });

    it("accepts password exactly 12 characters long", async () => {
      const res = await request(app)
        .post("/users")
        .send({ ...validUserData, password: "ValidPass123" });

      expect(res.statusCode).toBe(201);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("id");
    });

    it("accepts password exactly 128 characters long", async () => {
      const res = await request(app)
        .post("/users")
        .send({ ...validUserData, password: "a".repeat(128) });

      expect(res.statusCode).toBe(201);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("id");
    });

    it("accepts password with special characters", async () => {
      const res = await request(app)
        .post("/users")
        .send({ ...validUserData, password: "P@ssw0rd!#$%^&*()" });

      expect(res.statusCode).toBe(201);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("id");
    });
  });

  describe("Successful validation", () => {
    it("returns 201 for valid user data", async () => {
      const res = await request(app).post("/users").send(validUserData);

      expect(res.statusCode).toBe(201);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("id");
    });

    it("returns 201 for valid user with all allowed characters", async () => {
      const res = await request(app).post("/users").send({
        username: "user_name_123",
        password: "SecureP@ssw0rd!",
        email: "user.name+tag@example.co.uk",
      });

      expect(res.statusCode).toBe(201);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("id");
    });
  });
});
