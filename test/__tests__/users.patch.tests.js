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

describe("PATCH /users/me - Integration Tests", () => {
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

  describe("Content-Type validation", () => {
    it("returns 415 when Content-Type is not JSON", async () => {
      const res = await request(app)
        .patch("/users/me")
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
      const res = await request(app)
        .patch("/users/me")
        .send({ profile: { firstName: "John" } });

      expect(res.statusCode).toBe(401);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
    });

    it("returns 401 when authorization header doesn't start with Bearer", async () => {
      const res = await request(app)
        .patch("/users/me")
        .set("Authorization", "InvalidToken")
        .send({ profile: { firstName: "John" } });

      expect(res.statusCode).toBe(401);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
    });

    it("returns 401 for invalid token", async () => {
      const res = await request(app)
        .patch("/users/me")
        .set("Authorization", "Bearer invalid.token.here")
        .send({ profile: { firstName: "John" } });

      expect(res.statusCode).toBe(401);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
    });
  });

  describe("Profile object validation", () => {
    it("returns 400 when profile is missing", async () => {
      const res = await request(app)
        .patch("/users/me")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toBe("profile (object) must be provided.");
    });

    it("returns 400 when profile is null", async () => {
      const res = await request(app)
        .patch("/users/me")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({ profile: null });

      expect(res.statusCode).toBe(400);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toBe("profile (object) must be provided.");
    });

    it("returns 400 when profile is not an object", async () => {
      const res = await request(app)
        .patch("/users/me")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({ profile: "not an object" });

      expect(res.statusCode).toBe(400);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toBe("profile (object) must be provided.");
    });

    it("returns 400 when profile is an array", async () => {
      const res = await request(app)
        .patch("/users/me")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({ profile: [] });

      expect(res.statusCode).toBe(400);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toBe("profile (object) must be provided.");
    });

    it("returns 400 for unknown field in profile", async () => {
      const res = await request(app)
        .patch("/users/me")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({ profile: { unknownField: "value" } });

      expect(res.statusCode).toBe(400);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toBe("Unknown field: unknownField");
    });

    it("returns 400 for multiple unknown fields", async () => {
      const res = await request(app)
        .patch("/users/me")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({ profile: { age: 25, city: "Stockholm" } });

      expect(res.statusCode).toBe(400);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
    });
  });

  describe("firstName validation", () => {
    it("returns 400 for empty string firstName", async () => {
      const res = await request(app)
        .patch("/users/me")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({ profile: { firstName: "" } });

      expect(res.statusCode).toBe(400);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
    });

    it("returns 400 for firstName with numbers", async () => {
      const res = await request(app)
        .patch("/users/me")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({ profile: { firstName: "John123" } });

      expect(res.statusCode).toBe(400);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
    });

    it("returns 400 for firstName with special characters", async () => {
      const res = await request(app)
        .patch("/users/me")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({ profile: { firstName: "John@Doe" } });

      expect(res.statusCode).toBe(400);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
    });

    it("returns 400 for firstName that is too short", async () => {
      const res = await request(app)
        .patch("/users/me")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({ profile: { firstName: "J" } });

      expect(res.statusCode).toBe(400);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
    });

    it("returns 400 for firstName that is too long", async () => {
      const res = await request(app)
        .patch("/users/me")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({ profile: { firstName: "A".repeat(51) } });

      expect(res.statusCode).toBe(400);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
    });
  });

  describe("lastName validation", () => {
    it("returns 400 for empty string lastName", async () => {
      const res = await request(app)
        .patch("/users/me")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({ profile: { lastName: "" } });

      expect(res.statusCode).toBe(400);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
    });

    it("returns 400 for lastName with numbers", async () => {
      const res = await request(app)
        .patch("/users/me")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({ profile: { lastName: "Doe123" } });

      expect(res.statusCode).toBe(400);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
    });

    it("returns 400 for lastName with special characters", async () => {
      const res = await request(app)
        .patch("/users/me")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({ profile: { lastName: "Doe#Smith" } });

      expect(res.statusCode).toBe(400);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
    });
  });

  describe("dateOfBirth validation", () => {
    it("returns 400 for invalid date format", async () => {
      const res = await request(app)
        .patch("/users/me")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({ profile: { dateOfBirth: "1990-13-45" } });

      expect(res.statusCode).toBe(400);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
    });

    it("returns 400 for non-ISO date format", async () => {
      const res = await request(app)
        .patch("/users/me")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({ profile: { dateOfBirth: "12/31/1990" } });

      expect(res.statusCode).toBe(400);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
    });

    it("returns 400 for empty string dateOfBirth", async () => {
      const res = await request(app)
        .patch("/users/me")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({ profile: { dateOfBirth: "" } });

      expect(res.statusCode).toBe(400);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
    });
  });

  describe("heightCm validation", () => {
    it("returns 400 for negative heightCm", async () => {
      const res = await request(app)
        .patch("/users/me")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({ profile: { heightCm: -180 } });

      expect(res.statusCode).toBe(400);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
    });

    it("returns 400 for zero heightCm", async () => {
      const res = await request(app)
        .patch("/users/me")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({ profile: { heightCm: 0 } });

      expect(res.statusCode).toBe(400);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
    });

    it("returns 400 for string heightCm", async () => {
      const res = await request(app)
        .patch("/users/me")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({ profile: { heightCm: "180" } });

      expect(res.statusCode).toBe(400);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
    });
  });

  describe("weightKg validation", () => {
    it("returns 400 for negative weightKg", async () => {
      const res = await request(app)
        .patch("/users/me")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({ profile: { weightKg: -70 } });

      expect(res.statusCode).toBe(400);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
    });

    it("returns 400 for zero weightKg", async () => {
      const res = await request(app)
        .patch("/users/me")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({ profile: { weightKg: 0 } });

      expect(res.statusCode).toBe(400);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
    });

    it("returns 400 for string weightKg", async () => {
      const res = await request(app)
        .patch("/users/me")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({ profile: { weightKg: "70" } });

      expect(res.statusCode).toBe(400);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
    });
  });

  describe("Successful profile updates", () => {
    it("returns 200 when updating firstName only", async () => {
      const res = await request(app)
        .patch("/users/me")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({ profile: { firstName: "John" } });

      expect(res.statusCode).toBe(200);
      expect(res.headers["content-type"]).toMatch(/json/);
    });

    it("returns 200 when updating lastName only", async () => {
      const res = await request(app)
        .patch("/users/me")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({ profile: { lastName: "Doe" } });

      expect(res.statusCode).toBe(200);
      expect(res.headers["content-type"]).toMatch(/json/);
    });

    it("returns 200 when updating dateOfBirth only", async () => {
      const res = await request(app)
        .patch("/users/me")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({ profile: { dateOfBirth: "1990-05-15" } });

      expect(res.statusCode).toBe(200);
      expect(res.headers["content-type"]).toMatch(/json/);
    });

    it("returns 200 when updating heightCm only", async () => {
      const res = await request(app)
        .patch("/users/me")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({ profile: { heightCm: 180 } });

      expect(res.statusCode).toBe(200);
      expect(res.headers["content-type"]).toMatch(/json/);
    });

    it("returns 200 when updating weightKg only", async () => {
      const res = await request(app)
        .patch("/users/me")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({ profile: { weightKg: 75 } });

      expect(res.statusCode).toBe(200);
      expect(res.headers["content-type"]).toMatch(/json/);
    });

    it("returns 200 when updating multiple fields", async () => {
      const res = await request(app)
        .patch("/users/me")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({
          profile: {
            firstName: "Jane",
            lastName: "Smith",
            dateOfBirth: "1992-08-20",
          },
        });

      expect(res.statusCode).toBe(200);
      expect(res.headers["content-type"]).toMatch(/json/);
    });

    it("returns 200 when updating all fields", async () => {
      const res = await request(app)
        .patch("/users/me")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({
          profile: {
            firstName: "Alice",
            lastName: "Johnson",
            dateOfBirth: "1985-03-10",
            heightCm: 165,
            weightKg: 60,
          },
        });

      expect(res.statusCode).toBe(200);
      expect(res.headers["content-type"]).toMatch(/json/);
    });

    it("allows different users to update their own profiles", async () => {
      const res1 = await request(app)
        .patch("/users/me")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({ profile: { firstName: "Anna" } });

      const res2 = await request(app)
        .patch("/users/me")
        .set("Authorization", `Bearer ${user2Token}`)
        .send({ profile: { firstName: "Boris" } });

      expect(res1.statusCode).toBe(200);
      expect(res2.statusCode).toBe(200);
    });

    it("accepts valid name with hyphens", async () => {
      const res = await request(app)
        .patch("/users/me")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({ profile: { firstName: "Anne-Marie" } });

      expect(res.statusCode).toBe(200);
      expect(res.headers["content-type"]).toMatch(/json/);
    });

    it("accepts valid name with apostrophes", async () => {
      const res = await request(app)
        .patch("/users/me")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({ profile: { lastName: "O'Brien" } });

      expect(res.statusCode).toBe(200);
      expect(res.headers["content-type"]).toMatch(/json/);
    });

    it("accepts valid name with spaces", async () => {
      const res = await request(app)
        .patch("/users/me")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({ profile: { firstName: "Mary Jane" } });

      expect(res.statusCode).toBe(200);
      expect(res.headers["content-type"]).toMatch(/json/);
    });

    it("accepts decimal values for heightCm", async () => {
      const res = await request(app)
        .patch("/users/me")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({ profile: { heightCm: 175.5 } });

      expect(res.statusCode).toBe(200);
      expect(res.headers["content-type"]).toMatch(/json/);
    });

    it("accepts decimal values for weightKg", async () => {
      const res = await request(app)
        .patch("/users/me")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({ profile: { weightKg: 72.3 } });

      expect(res.statusCode).toBe(200);
      expect(res.headers["content-type"]).toMatch(/json/);
    });
  });
});
