const request = require("supertest");
const app = require("../../src/app.js");
const seeding = require("../helpers/seeding.js");
const User = require("../../src/models/users.models.js");

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

describe("PATCH /users/me/account (password) - Integration Tests", () => {
  let user1Token;

  beforeAll(async () => {
    const loginRes = await request(app).post("/auth/login").send({
      email: testUser1.email,
      password: testUser1.password,
    });
    expect(loginRes.statusCode).toBe(200);
    expect(loginRes.body).toHaveProperty("token");
    user1Token = loginRes.body.token;
  });

  afterEach(async () => {
    await User.deleteMany({});
    await seeding.seedData(User, "users");
  });

  describe("Content-Type validation", () => {
    it("returns 415 when Content-Type is not JSON", async () => {
      const res = await request(app)
        .patch("/users/me/account")
        .set("Content-Type", "text/plain")
        .set("Authorization", `Bearer ${user1Token}`)
        .send("not json");

      expect(res.statusCode).toBe(415);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toBe("Content-Type must be json.");
    });
  });

  describe("Authentication validation", () => {
    it("returns 401 when no authorization header is provided", async () => {
      const res = await request(app).patch("/users/me/account").send({
        currentPassword: testUser1.password,
        newPassword: "NewPassword456!",
      });

      expect(res.statusCode).toBe(401);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
    });

    it("returns 401 when authorization header doesn't start with Bearer", async () => {
      const res = await request(app)
        .patch("/users/me/account")
        .set("Authorization", "InvalidToken")
        .send({
          currentPassword: testUser1.password,
          newPassword: "NewPassword456!",
        });

      expect(res.statusCode).toBe(401);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
    });

    it("returns 401 for invalid token", async () => {
      const res = await request(app)
        .patch("/users/me/account")
        .set("Authorization", "Bearer invalid.token.here")
        .send({
          currentPassword: testUser1.password,
          newPassword: "NewPassword456!",
        });

      expect(res.statusCode).toBe(401);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
    });
  });

  describe("currentPassword validation", () => {
    it("returns 400 when currentPassword is missing", async () => {
      const res = await request(app)
        .patch("/users/me/account")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({ newPassword: "NewPassword456!" });

      expect(res.statusCode).toBe(400);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toBe("currentPassword must be provided.");
    });

    it("returns 401 when currentPassword is incorrect", async () => {
      const res = await request(app)
        .patch("/users/me/account")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({
          currentPassword: "WrongPassword123!",
          newPassword: "NewPassword456!",
        });

      expect(res.statusCode).toBe(401);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
    });
  });

  describe("Field update validation", () => {
    it("returns 400 when no update field is provided", async () => {
      const res = await request(app)
        .patch("/users/me/account")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({ currentPassword: testUser1.password });

      expect(res.statusCode).toBe(400);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toBe(
        "Request body must include currentPassword and only one of: newPassword, newEmail, newUsername.",
      );
    });

    it("returns 400 when multiple update fields are provided", async () => {
      const res = await request(app)
        .patch("/users/me/account")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({
          currentPassword: testUser1.password,
          newPassword: "NewPassword456!",
          newEmail: "newemail@test.com",
        });

      expect(res.statusCode).toBe(400);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toBe(
        "Request body must include currentPassword and only one of: newPassword, newEmail, newUsername.",
      );
    });

    it("returns 400 when all three update fields are provided", async () => {
      const res = await request(app)
        .patch("/users/me/account")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({
          currentPassword: testUser1.password,
          newPassword: "NewPassword456!",
          newEmail: "newemail@test.com",
          newUsername: "newusername123",
        });

      expect(res.statusCode).toBe(400);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toBe(
        "Request body must include currentPassword and only one of: newPassword, newEmail, newUsername.",
      );
    });
  });

  describe("newPassword validation", () => {
    it("returns 400 when newPassword is too short", async () => {
      const res = await request(app)
        .patch("/users/me/account")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({
          currentPassword: testUser1.password,
          newPassword: "Short1!",
        });

      expect(res.statusCode).toBe(400);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toBe(
        "Password must be at least 12 characters long.",
      );
    });

    it("returns 400 when newPassword is too long", async () => {
      const res = await request(app)
        .patch("/users/me/account")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({
          currentPassword: testUser1.password,
          newPassword: "A".repeat(129),
        });

      expect(res.statusCode).toBe(400);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toBe(
        "Password must be at most 128 characters long.",
      );
    });

    it("returns 400 when newPassword is not a string", async () => {
      const res = await request(app)
        .patch("/users/me/account")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({
          currentPassword: testUser1.password,
          newPassword: 123456789012,
        });

      expect(res.statusCode).toBe(400);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toBe("Password must be a string.");
    });
  });

  describe("Successful password updates", () => {
    it("returns 200 when updating password with valid credentials", async () => {
      const res = await request(app)
        .patch("/users/me/account")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({
          currentPassword: testUser1.password,
          newPassword: "NewPassword456!",
        });

      expect(res.statusCode).toBe(200);
    });

    it("invalidates previous token after password update", async () => {
      // Get current token
      const oldToken = user1Token;

      // Update password
      await request(app)
        .patch("/users/me/account")
        .set("Authorization", `Bearer ${oldToken}`)
        .send({
          currentPassword: testUser1.password,
          newPassword: "BrandNewPassword123!",
        });

      // Try to use old token to access protected endpoint
      const res = await request(app)
        .get("/users/me")
        .set("Authorization", `Bearer ${oldToken}`);

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("error");
    });

    it("allows successful login with new token after password update", async () => {
      // Update password
      await request(app)
        .patch("/users/me/account")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({
          currentPassword: testUser1.password,
          newPassword: "FreshPassword999!",
        });

      // Login with new password to get new token
      const loginRes = await request(app).post("/auth/login").send({
        email: testUser1.email,
        password: "FreshPassword999!",
      });

      expect(loginRes.statusCode).toBe(200);
      expect(loginRes.body).toHaveProperty("token");

      const newToken = loginRes.body.token;

      // Use new token to access protected endpoint
      const res = await request(app)
        .get("/users/me")
        .set("Authorization", `Bearer ${newToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("account");
    });

    it("allows login with new password after update", async () => {
      // Update password
      await request(app)
        .patch("/users/me/account")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({
          currentPassword: testUser1.password,
          newPassword: "UpdatedPassword789!",
        });

      // Try to login with new password
      const loginRes = await request(app).post("/auth/login").send({
        email: testUser1.email,
        password: "UpdatedPassword789!",
      });

      expect(loginRes.statusCode).toBe(200);
      expect(loginRes.body).toHaveProperty("token");
    });

    it("rejects login with old password after update", async () => {
      // Update password
      await request(app)
        .patch("/users/me/account")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({
          currentPassword: testUser1.password,
          newPassword: "AnotherPassword321!",
        });

      // Try to login with old password
      const loginRes = await request(app).post("/auth/login").send({
        email: testUser1.email,
        password: testUser1.password,
      });

      expect(loginRes.statusCode).toBe(401);
    });
  });
});

describe("PATCH /users/me/account (email) - Integration Tests", () => {
  let user2Token;

  beforeAll(async () => {
    const loginRes = await request(app).post("/auth/login").send({
      email: testUser2.email,
      password: testUser2.password,
    });
    user2Token = loginRes.body.token;
  });

  afterEach(async () => {
    await User.deleteMany({});
    await seeding.seedData(User, "users");
  });

  describe("Content-Type validation", () => {
    it("returns 415 when Content-Type is not JSON", async () => {
      const res = await request(app)
        .patch("/users/me/account")
        .set("Content-Type", "text/plain")
        .set("Authorization", `Bearer ${user2Token}`)
        .send("not json");

      expect(res.statusCode).toBe(415);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toBe("Content-Type must be json.");
    });
  });

  describe("Authentication validation", () => {
    it("returns 401 when no authorization header is provided", async () => {
      const res = await request(app).patch("/users/me/account").send({
        currentPassword: testUser2.password,
        newEmail: "newemail@test.com",
      });

      expect(res.statusCode).toBe(401);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
    });

    it("returns 401 for invalid token", async () => {
      const res = await request(app)
        .patch("/users/me/account")
        .set("Authorization", "Bearer invalid.token.here")
        .send({
          currentPassword: testUser2.password,
          newEmail: "newemail@test.com",
        });

      expect(res.statusCode).toBe(401);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
    });
  });

  describe("currentPassword validation", () => {
    it("returns 400 when currentPassword is missing", async () => {
      const res = await request(app)
        .patch("/users/me/account")
        .set("Authorization", `Bearer ${user2Token}`)
        .send({ newEmail: "newemail@test.com" });

      expect(res.statusCode).toBe(400);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toBe("currentPassword must be provided.");
    });

    it("returns 401 when currentPassword is incorrect", async () => {
      const res = await request(app)
        .patch("/users/me/account")
        .set("Authorization", `Bearer ${user2Token}`)
        .send({
          currentPassword: "WrongPassword123!",
          newEmail: "newemail@test.com",
        });

      expect(res.statusCode).toBe(401);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
    });
  });

  describe("newEmail validation", () => {
    it("returns 400 when newEmail is not a valid email format", async () => {
      const res = await request(app)
        .patch("/users/me/account")
        .set("Authorization", `Bearer ${user2Token}`)
        .send({
          currentPassword: testUser2.password,
          newEmail: "notanemail",
        });

      expect(res.statusCode).toBe(400);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toBe("Email must be a valid email address.");
    });

    it("returns 400 when newEmail contains whitespace", async () => {
      const res = await request(app)
        .patch("/users/me/account")
        .set("Authorization", `Bearer ${user2Token}`)
        .send({
          currentPassword: testUser2.password,
          newEmail: "new email@test.com",
        });

      expect(res.statusCode).toBe(400);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toBe("Email must not contain whitespace.");
    });

    it("returns 400 when newEmail is too long", async () => {
      const res = await request(app)
        .patch("/users/me/account")
        .set("Authorization", `Bearer ${user2Token}`)
        .send({
          currentPassword: testUser2.password,
          newEmail: "a".repeat(250) + "@test.com",
        });

      expect(res.statusCode).toBe(400);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toBe("Email is too long.");
    });

    it("returns 400 when newEmail is not a string", async () => {
      const res = await request(app)
        .patch("/users/me/account")
        .set("Authorization", `Bearer ${user2Token}`)
        .send({
          currentPassword: testUser2.password,
          newEmail: 12345,
        });

      expect(res.statusCode).toBe(400);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toBe("Email must be a string.");
    });
  });

  describe("Successful email updates", () => {
    it("returns 200 when updating email with valid credentials", async () => {
      const res = await request(app)
        .patch("/users/me/account")
        .set("Authorization", `Bearer ${user2Token}`)
        .send({
          currentPassword: testUser2.password,
          newEmail: "updated_runner02@test.com",
        });

      expect(res.statusCode).toBe(200);
    });

    it("invalidates previous token after email update", async () => {
      // Get current token
      const oldToken = user2Token;

      // Update email
      await request(app)
        .patch("/users/me/account")
        .set("Authorization", `Bearer ${oldToken}`)
        .send({
          currentPassword: testUser2.password,
          newEmail: "completely_new_email@test.com",
        });

      // Try to use old token to access protected endpoint
      const res = await request(app)
        .get("/users/me")
        .set("Authorization", `Bearer ${oldToken}`);

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("error");
    });

    it("allows login with new email after update", async () => {
      // Update email
      await request(app)
        .patch("/users/me/account")
        .set("Authorization", `Bearer ${user2Token}`)
        .send({
          currentPassword: testUser2.password,
          newEmail: "new_runner02@test.com",
        });

      // Try to login with new email
      const loginRes = await request(app).post("/auth/login").send({
        email: "new_runner02@test.com",
        password: testUser2.password,
      });

      expect(loginRes.statusCode).toBe(200);
      expect(loginRes.body).toHaveProperty("token");
    });

    it("rejects login with old email after update", async () => {
      // Update email
      await request(app)
        .patch("/users/me/account")
        .set("Authorization", `Bearer ${user2Token}`)
        .send({
          currentPassword: testUser2.password,
          newEmail: "latest_runner02@test.com",
        });

      // Try to login with old email
      const loginRes = await request(app).post("/auth/login").send({
        email: testUser2.email,
        password: testUser2.password,
      });

      expect(loginRes.statusCode).toBe(401);
    });
  });
});

describe("PATCH /users/me/account (username) - Integration Tests", () => {
  let user1Token;

  beforeAll(async () => {
    const loginRes = await request(app).post("/auth/login").send({
      email: testUser1.email,
      password: testUser1.password,
    });
    user1Token = loginRes.body.token;
  });

  afterEach(async () => {
    await User.deleteMany({});
    await seeding.seedData(User, "users");
  });

  describe("Content-Type validation", () => {
    it("returns 415 when Content-Type is not JSON", async () => {
      const res = await request(app)
        .patch("/users/me/account")
        .set("Content-Type", "text/plain")
        .set("Authorization", `Bearer ${user1Token}`)
        .send("not json");

      expect(res.statusCode).toBe(415);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toBe("Content-Type must be json.");
    });
  });

  describe("Authentication validation", () => {
    it("returns 401 when no authorization header is provided", async () => {
      const res = await request(app).patch("/users/me/account").send({
        currentPassword: testUser1.password,
        newUsername: "new_username",
      });

      expect(res.statusCode).toBe(401);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
    });

    it("returns 401 for invalid token", async () => {
      const res = await request(app)
        .patch("/users/me/account")
        .set("Authorization", "Bearer invalid.token.here")
        .send({
          currentPassword: testUser1.password,
          newUsername: "new_username",
        });

      expect(res.statusCode).toBe(401);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
    });
  });

  describe("currentPassword validation", () => {
    it("returns 400 when currentPassword is missing", async () => {
      const res = await request(app)
        .patch("/users/me/account")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({ newUsername: "new_username" });

      expect(res.statusCode).toBe(400);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toBe("currentPassword must be provided.");
    });

    it("returns 401 when currentPassword is incorrect", async () => {
      const res = await request(app)
        .patch("/users/me/account")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({
          currentPassword: "WrongPassword123!",
          newUsername: "new_username",
        });

      expect(res.statusCode).toBe(401);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
    });
  });

  describe("newUsername validation", () => {
    it("returns 400 when newUsername is too short", async () => {
      const res = await request(app)
        .patch("/users/me/account")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({
          currentPassword: testUser1.password,
          newUsername: "short",
        });

      expect(res.statusCode).toBe(400);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toBe(
        "Username must be between 6 and 30 characters long.",
      );
    });

    it("returns 400 when newUsername is too long", async () => {
      const res = await request(app)
        .patch("/users/me/account")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({
          currentPassword: testUser1.password,
          newUsername: "a".repeat(31),
        });

      expect(res.statusCode).toBe(400);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toBe(
        "Username must be between 6 and 30 characters long.",
      );
    });

    it("returns 400 when newUsername contains special characters", async () => {
      const res = await request(app)
        .patch("/users/me/account")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({
          currentPassword: testUser1.password,
          newUsername: "user@name",
        });

      expect(res.statusCode).toBe(400);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toBe(
        "Username may only contain letters, numbers, and underscores.",
      );
    });

    it("returns 400 when newUsername contains spaces", async () => {
      const res = await request(app)
        .patch("/users/me/account")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({
          currentPassword: testUser1.password,
          newUsername: "user name",
        });

      expect(res.statusCode).toBe(400);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toBe(
        "Username may only contain letters, numbers, and underscores.",
      );
    });

    it("returns 400 when newUsername is not a string", async () => {
      const res = await request(app)
        .patch("/users/me/account")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({
          currentPassword: testUser1.password,
          newUsername: 123456,
        });

      expect(res.statusCode).toBe(400);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toBe("Username must be a string.");
    });
  });

  describe("Successful username updates", () => {
    it("returns 200 when updating username with valid credentials", async () => {
      const res = await request(app)
        .patch("/users/me/account")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({
          currentPassword: testUser1.password,
          newUsername: "updated_runner_01",
        });

      expect(res.statusCode).toBe(200);
    });

    it("invalidates previous token after username update", async () => {
      // Get current token
      const oldToken = user1Token;

      // Update username
      await request(app)
        .patch("/users/me/account")
        .set("Authorization", `Bearer ${oldToken}`)
        .send({
          currentPassword: testUser1.password,
          newUsername: "totally_new_username",
        });

      // Try to use old token to access protected endpoint
      const res = await request(app)
        .get("/users/me")
        .set("Authorization", `Bearer ${oldToken}`);

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("error");
    });

    it("allows login with new username after update", async () => {
      // Update username
      await request(app)
        .patch("/users/me/account")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({
          currentPassword: testUser1.password,
          newUsername: "newest_runner_01",
        });

      // Try to login with new username
      const loginRes = await request(app).post("/auth/login").send({
        username: "newest_runner_01",
        password: testUser1.password,
      });

      expect(loginRes.statusCode).toBe(200);
      expect(loginRes.body).toHaveProperty("token");
    });

    it("rejects login with old username after update", async () => {
      // Update username
      await request(app)
        .patch("/users/me/account")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({
          currentPassword: testUser1.password,
          newUsername: "final_runner_01",
        });

      // Try to login with old username
      const loginRes = await request(app).post("/auth/login").send({
        username: testUser1.username,
        password: testUser1.password,
      });

      expect(loginRes.statusCode).toBe(401);
    });

    it("accepts valid username with underscores", async () => {
      const res = await request(app)
        .patch("/users/me/account")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({
          currentPassword: testUser1.password,
          newUsername: "valid_user_name_123",
        });

      expect(res.statusCode).toBe(200);
    });

    it("accepts valid username with numbers", async () => {
      const res = await request(app)
        .patch("/users/me/account")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({
          currentPassword: testUser1.password,
          newUsername: "username123456",
        });

      expect(res.statusCode).toBe(200);
    });
  });
});
