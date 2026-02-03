const request = require("supertest");
const app = require("../../../src/app.js");
const seeding = require("../../helpers/seeding.js");
const User = require("../../../src/models/users.models.js");
const { TEST_USERS } = require("../../helpers/test-data");
const { getAuthToken } = require("../../helpers/auth.helpers");
const {
  expect400WithMessage,
  expect401Error,
  expect415Error,
} = require("../../helpers/assertions");
const {
  getAuthValidationTests,
  getContentTypeTests,
} = require("../../helpers/request.helpers");

/**
 * Test suite for PATCH /users/me/account endpoint
 * Covers password, email, and username updates
 */
describe("PATCH /users/me/account", () => {
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

  afterEach(async () => {
    // Reseed data after each test to maintain consistent state
    await User.deleteMany({});
    await seeding.seedData(User, "users");
  });

  describe("Common validations", () => {
    describe("Content-Type validation", () => {
      getContentTypeTests().forEach(({ name, contentType, body }) => {
        it(name, async () => {
          const res = await request(app)
            .patch("/users/me/account")
            .set("Content-Type", contentType)
            .set("Authorization", `Bearer ${user1Token}`)
            .send(body);

          expect415Error(res);
        });
      });
    });

    describe("Authentication validation", () => {
      getAuthValidationTests().forEach(({ name, setupAuth }) => {
        it(name, async () => {
          const req = request(app).patch("/users/me/account").send({
            currentPassword: TEST_USERS.user1.password,
            newPassword: "NewPassword456!",
          });
          const res = await setupAuth(req);

          expect401Error(res);
        });
      });
    });

    describe("currentPassword validation", () => {
      it("returns 400 when currentPassword is missing", async () => {
        const res = await request(app)
          .patch("/users/me/account")
          .set("Authorization", `Bearer ${user1Token}`)
          .send({ newPassword: "NewPassword456!" });

        expect400WithMessage(res, "currentPassword must be provided.");
      });

      it("returns 401 when currentPassword is incorrect", async () => {
        const res = await request(app)
          .patch("/users/me/account")
          .set("Authorization", `Bearer ${user1Token}`)
          .send({
            currentPassword: "WrongPassword123!",
            newPassword: "NewPassword456!",
          });

        expect401Error(res);
      });
    });

    describe("Field update validation", () => {
      const invalidFieldCombinations = [
        {
          data: { currentPassword: TEST_USERS.user1.password },
          desc: "no update field",
        },
        {
          data: {
            currentPassword: TEST_USERS.user1.password,
            newPassword: "NewPassword456!",
            newEmail: "newemail@test.com",
          },
          desc: "multiple update fields",
        },
        {
          data: {
            currentPassword: TEST_USERS.user1.password,
            newPassword: "NewPassword456!",
            newEmail: "newemail@test.com",
            newUsername: "newusername123",
          },
          desc: "all three update fields",
        },
      ];

      invalidFieldCombinations.forEach(({ data, desc }) => {
        it(`returns 400 when ${desc} provided`, async () => {
          const res = await request(app)
            .patch("/users/me/account")
            .set("Authorization", `Bearer ${user1Token}`)
            .send(data);

          expect400WithMessage(
            res,
            "Request body must include currentPassword and only one of: newPassword, newEmail, newUsername.",
          );
        });
      });
    });
  });

  describe("Password updates", () => {
    const passwordValidationCases = [
      {
        password: "Short1!",
        message: "Password must be at least 12 characters long.",
      },
      {
        password: "A".repeat(129),
        message: "Password must be at most 128 characters long.",
      },
      { password: 123456789012, message: "Password must be a string." },
    ];

    passwordValidationCases.forEach(({ password, message }) => {
      it(`returns 400 for invalid newPassword: ${message}`, async () => {
        const res = await request(app)
          .patch("/users/me/account")
          .set("Authorization", `Bearer ${user1Token}`)
          .send({
            currentPassword: TEST_USERS.user1.password,
            newPassword: password,
          });

        expect400WithMessage(res, message);
      });
    });

    it("successfully updates password", async () => {
      const res = await request(app)
        .patch("/users/me/account")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({
          currentPassword: TEST_USERS.user1.password,
          newPassword: "NewPassword456!",
        });

      expect(res.statusCode).toBe(200);
    });

    it("invalidates previous token after password update", async () => {
      const oldToken = user1Token;

      await request(app)
        .patch("/users/me/account")
        .set("Authorization", `Bearer ${oldToken}`)
        .send({
          currentPassword: TEST_USERS.user1.password,
          newPassword: "BrandNewPassword123!",
        });

      const res = await request(app)
        .get("/users/me")
        .set("Authorization", `Bearer ${oldToken}`);

      expect401Error(res);
    });

    it("allows login with new password after update", async () => {
      await request(app)
        .patch("/users/me/account")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({
          currentPassword: TEST_USERS.user1.password,
          newPassword: "UpdatedPassword789!",
        });

      const loginRes = await request(app).post("/auth/login").send({
        email: TEST_USERS.user1.email,
        password: "UpdatedPassword789!",
      });

      expect(loginRes.statusCode).toBe(200);
      expect(loginRes.body).toHaveProperty("token");
    });

    it("rejects login with old password after update", async () => {
      await request(app)
        .patch("/users/me/account")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({
          currentPassword: TEST_USERS.user1.password,
          newPassword: "AnotherPassword321!",
        });

      const loginRes = await request(app).post("/auth/login").send({
        email: TEST_USERS.user1.email,
        password: TEST_USERS.user1.password,
      });

      expect(loginRes.statusCode).toBe(401);
    });
  });

  describe("Email updates", () => {
    const emailValidationCases = [
      { email: "notanemail", message: "Email must be a valid email address." },
      {
        email: "new email@test.com",
        message: "Email must not contain whitespace.",
      },
      { email: "a".repeat(250) + "@test.com", message: "Email is too long." },
      { email: 12345, message: "Email must be a string." },
    ];

    emailValidationCases.forEach(({ email, message }) => {
      it(`returns 400 for invalid newEmail: ${message}`, async () => {
        const res = await request(app)
          .patch("/users/me/account")
          .set("Authorization", `Bearer ${user2Token}`)
          .send({
            currentPassword: TEST_USERS.user2.password,
            newEmail: email,
          });

        expect400WithMessage(res, message);
      });
    });

    it("successfully updates email", async () => {
      const res = await request(app)
        .patch("/users/me/account")
        .set("Authorization", `Bearer ${user2Token}`)
        .send({
          currentPassword: TEST_USERS.user2.password,
          newEmail: "updated_runner02@test.com",
        });

      expect(res.statusCode).toBe(200);
    });

    it("invalidates previous token after email update", async () => {
      const oldToken = user2Token;

      await request(app)
        .patch("/users/me/account")
        .set("Authorization", `Bearer ${oldToken}`)
        .send({
          currentPassword: TEST_USERS.user2.password,
          newEmail: "completely_new_email@test.com",
        });

      const res = await request(app)
        .get("/users/me")
        .set("Authorization", `Bearer ${oldToken}`);

      expect401Error(res);
    });

    it("allows login with new email after update", async () => {
      await request(app)
        .patch("/users/me/account")
        .set("Authorization", `Bearer ${user2Token}`)
        .send({
          currentPassword: TEST_USERS.user2.password,
          newEmail: "new_runner02@test.com",
        });

      const loginRes = await request(app).post("/auth/login").send({
        email: "new_runner02@test.com",
        password: TEST_USERS.user2.password,
      });

      expect(loginRes.statusCode).toBe(200);
      expect(loginRes.body).toHaveProperty("token");
    });

    it("rejects login with old email after update", async () => {
      await request(app)
        .patch("/users/me/account")
        .set("Authorization", `Bearer ${user2Token}`)
        .send({
          currentPassword: TEST_USERS.user2.password,
          newEmail: "latest_runner02@test.com",
        });

      const loginRes = await request(app).post("/auth/login").send({
        email: TEST_USERS.user2.email,
        password: TEST_USERS.user2.password,
      });

      expect(loginRes.statusCode).toBe(401);
    });
  });

  describe("Username updates", () => {
    const usernameValidationCases = [
      {
        username: "short",
        message: "Username must be between 6 and 30 characters long.",
      },
      {
        username: "a".repeat(31),
        message: "Username must be between 6 and 30 characters long.",
      },
      {
        username: "user@name",
        message: "Username may only contain letters, numbers, and underscores.",
      },
      {
        username: "user name",
        message: "Username may only contain letters, numbers, and underscores.",
      },
      { username: 123456, message: "Username must be a string." },
    ];

    usernameValidationCases.forEach(({ username, message }) => {
      it(`returns 400 for invalid newUsername: ${message}`, async () => {
        const res = await request(app)
          .patch("/users/me/account")
          .set("Authorization", `Bearer ${user1Token}`)
          .send({
            currentPassword: TEST_USERS.user1.password,
            newUsername: username,
          });

        expect400WithMessage(res, message);
      });
    });

    it("successfully updates username", async () => {
      const res = await request(app)
        .patch("/users/me/account")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({
          currentPassword: TEST_USERS.user1.password,
          newUsername: "updated_runner_01",
        });

      expect(res.statusCode).toBe(200);
    });

    it("invalidates previous token after username update", async () => {
      const oldToken = user1Token;

      await request(app)
        .patch("/users/me/account")
        .set("Authorization", `Bearer ${oldToken}`)
        .send({
          currentPassword: TEST_USERS.user1.password,
          newUsername: "totally_new_username",
        });

      const res = await request(app)
        .get("/users/me")
        .set("Authorization", `Bearer ${oldToken}`);

      expect401Error(res);
    });

    it("allows login with new username after update", async () => {
      await request(app)
        .patch("/users/me/account")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({
          currentPassword: TEST_USERS.user1.password,
          newUsername: "newest_runner_01",
        });

      const loginRes = await request(app).post("/auth/login").send({
        username: "newest_runner_01",
        password: TEST_USERS.user1.password,
      });

      expect(loginRes.statusCode).toBe(200);
      expect(loginRes.body).toHaveProperty("token");
    });

    it("rejects login with old username after update", async () => {
      await request(app)
        .patch("/users/me/account")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({
          currentPassword: TEST_USERS.user1.password,
          newUsername: "final_runner_01",
        });

      const loginRes = await request(app).post("/auth/login").send({
        username: TEST_USERS.user1.username,
        password: TEST_USERS.user1.password,
      });

      expect(loginRes.statusCode).toBe(401);
    });

    const validUsernames = [
      { username: "valid_user_name_123", desc: "with underscores" },
      { username: "username123456", desc: "with numbers" },
    ];

    validUsernames.forEach(({ username, desc }) => {
      it(`accepts valid username ${desc}`, async () => {
        const res = await request(app)
          .patch("/users/me/account")
          .set("Authorization", `Bearer ${user1Token}`)
          .send({
            currentPassword: TEST_USERS.user1.password,
            newUsername: username,
          });

        expect(res.statusCode).toBe(200);
      });
    });
  });
});
