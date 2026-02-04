const request = require("supertest");
const app = require("../../../src/app.js");
const { VALID_USER_DATA } = require("../../helpers/test-data");
const {
  expect400WithMessage,
  expect409Error,
  expect415Error,
  expectJsonResponse,
} = require("../../helpers/assertions");

describe("POST /api/v1/auth/signup", () => {
  describe("Content-Type validation", () => {
    it("returns 415 when Content-Type is not JSON", async () => {
      const res = await request(app)
        .post("/api/v1/auth/signup")
        .set("Content-Type", "text/plain")
        .send("not json");

      expect415Error(res);
    });
  });
});

describe("Required fields validation", () => {
  it("returns 400 for empty JSON", async () => {
    const res = await request(app).post("/api/v1/auth/signup").send({});

    expect400WithMessage(
      res,
      "User data is missing required fields: username, password, email.",
    );
  });

  it.each(["username", "password", "email"])(
    "returns 400 for missing %s field",
    async (field) => {
      const { [field]: omitted, ...dataWithoutField } = VALID_USER_DATA;
      const res = await request(app)
        .post("/api/v1/auth/signup")
        .send(dataWithoutField);

      expect400WithMessage(
        res,
        `User data is missing required fields: ${field}.`,
      );
    },
  );

  it("returns 400 when field is null", async () => {
    const res = await request(app)
      .post("/api/v1/auth/signup")
      .send({ ...VALID_USER_DATA, username: null });

    expect400WithMessage(res, /username/);
  });
});

describe("Username validation", () => {
  it("returns 400 for non-string username", async () => {
    const res = await request(app)
      .post("/api/v1/auth/signup")
      .send({ ...VALID_USER_DATA, username: 12345 });

    expect400WithMessage(res, "Username must be a string.");
  });

  it.each([
    {
      username: "short",
      message: "Username must be between 6 and 30 characters long.",
    },
    {
      username: "a".repeat(31),
      message: "Username must be between 6 and 30 characters long.",
    },
  ])(
    "returns 400 for invalid username length: $username",
    async ({ username, message }) => {
      const res = await request(app)
        .post("/api/v1/auth/signup")
        .send({ ...VALID_USER_DATA, username });

      expect400WithMessage(res, message);
    },
  );

  it.each([
    { username: "user@name!", desc: "special characters" },
    { username: "user name", desc: "spaces" },
  ])("returns 400 for username with $desc", async ({ username }) => {
    const res = await request(app)
      .post("/api/v1/auth/signup")
      .send({ ...VALID_USER_DATA, username });

    expect400WithMessage(
      res,
      "Username may only contain letters, numbers, and underscores.",
    );
  });

  it.each([
    { username: "valid_user123", email: "valid_user123@example.com" },
    { username: "user12", email: "user12@example.com" }, // Exactly 6 chars
    { username: "a".repeat(30), email: "thirtychar@example.com" }, // Exactly 30 chars
  ])("accepts valid username: $username", async ({ username, email }) => {
    const res = await request(app).post("/api/v1/auth/signup").send({
      username,
      password: "SecurePassword123!",
      email,
    });

    expectJsonResponse(res, 201);
    expect(res.body.data).toHaveProperty("userId");
  });
});

describe("Email validation", () => {
  it("returns 400 for non-string email", async () => {
    const res = await request(app)
      .post("/api/v1/auth/signup")
      .send({ ...VALID_USER_DATA, email: 12345 });

    expect400WithMessage(res, "Email must be a string.");
  });

  it("returns 400 for email longer than 254 characters", async () => {
    const longEmail = "a".repeat(250) + "@test.com";
    const res = await request(app)
      .post("/api/v1/auth/signup")
      .send({ ...VALID_USER_DATA, email: longEmail });

    expect400WithMessage(res, "Email is too long.");
  });

  it.each([
    {
      email: "test user@example.com",
      message: "Email must not contain whitespace.",
    },
    {
      email: "invalidemail.com",
      message: "Email must be a valid email address.",
    },
    { email: "invalid@", message: "Email must be a valid email address." },
    { email: "", message: "Email must be a valid email address." },
  ])("returns 400 for invalid email: $email", async ({ email, message }) => {
    const res = await request(app)
      .post("/api/v1/auth/signup")
      .send({ ...VALID_USER_DATA, email });

    expect400WithMessage(res, message);
  });

  it.each([
    { email: "valid.email@example.com", username: "validemail" },
    { email: "user@mail.example.com", username: "subdomain" },
  ])("accepts valid email: $email", async ({ email, username }) => {
    const res = await request(app).post("/api/v1/auth/signup").send({
      username,
      password: "SecurePassword123!",
      email,
    });

    expectJsonResponse(res, 201);
    expect(res.body.data).toHaveProperty("userId");
  });
});

describe("Password validation", () => {
  it("returns 400 for non-string password", async () => {
    const res = await request(app)
      .post("/api/v1/auth/signup")
      .send({ ...VALID_USER_DATA, password: 12345 });

    expect400WithMessage(res, "Password must be a string.");
  });

  it.each([
    {
      password: "Short1!",
      message: "Password must be at least 12 characters long.",
    },
    {
      password: "a".repeat(129),
      message: "Password must be at most 128 characters long.",
    },
  ])(
    "returns 400 for password with invalid length",
    async ({ password, message }) => {
      const res = await request(app)
        .post("/api/v1/auth/signup")
        .send({ ...VALID_USER_DATA, password });

      expect400WithMessage(res, message);
    },
  );

  it.each([
    {
      password: "ValidPass123",
      username: "pass12char",
      email: "pass12char@example.com",
    },
    {
      password: "a".repeat(128),
      username: "pass128char",
      email: "pass128char@example.com",
    },
    {
      password: "P@ssw0rd!#$%^&*()",
      username: "passspecial",
      email: "passspecial@example.com",
    },
  ])("accepts valid password", async ({ password, username, email }) => {
    const res = await request(app).post("/api/v1/auth/signup").send({
      username,
      password,
      email,
    });

    expectJsonResponse(res, 201);
    expect(res.body.data).toHaveProperty("userId");
  });
});

describe("Uniqueness validation", () => {
  it("returns 409 for duplicate username", async () => {
    const firstUser = {
      username: "unique_user_001",
      password: "FirstPassword123!",
      email: "first@example.com",
    };
    await request(app).post("/api/v1/auth/signup").send(firstUser);

    const duplicateUsernameUser = {
      username: "unique_user_001",
      password: "DifferentPassword123!",
      email: "different@example.com",
    };
    const res = await request(app)
      .post("/api/v1/auth/signup")
      .send(duplicateUsernameUser);

    expect409Error(res);
  });

  it("returns 409 for duplicate email", async () => {
    const firstUser = {
      username: "unique_user_002",
      password: "FirstPassword123!",
      email: "duplicate@example.com",
    };
    await request(app).post("/api/v1/auth/signup").send(firstUser);

    const duplicateEmailUser = {
      username: "different_user",
      password: "DifferentPassword123!",
      email: "duplicate@example.com",
    };
    const res = await request(app)
      .post("/api/v1/auth/signup")
      .send(duplicateEmailUser);

    expect409Error(res);
  });

  it("handles concurrent duplicate requests safely", async () => {
    const userA = {
      username: "race_user",
      password: "Password123!",
      email: "a@example.com",
    };
    const userB = {
      username: "race_user",
      password: "Password456!",
      email: "b@example.com",
    };

    const results = await Promise.allSettled([
      request(app).post("/api/v1/auth/signup").send(userA),
      request(app).post("/api/v1/auth/signup").send(userB),
    ]);

    const statuses = results.map((r) => r.value.statusCode);
    expect(statuses).toContain(201);
    expect(statuses).toContain(409);
  });
});

describe("Successful registration", () => {
  it("returns 201 for valid user data", async () => {
    const res = await request(app).post("/api/v1/auth/signup").send({
      username: "newuser123",
      password: "SecurePassword123!",
      email: "newuser123@example.com",
    });

    expectJsonResponse(res, 201);
    expect(res.body.data).toHaveProperty("userId");
  });

  it("returns 201 for valid user with all allowed characters", async () => {
    const res = await request(app).post("/api/v1/auth/signup").send({
      username: "user_name_123",
      password: "SecureP@ssw0rd!",
      email: "user.name+tag@example.co.uk",
    });

    expectJsonResponse(res, 201);
    expect(res.body.data).toHaveProperty("userId");
  });
});
