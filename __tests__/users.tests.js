const request = require("supertest");
const app = require("../src/app.js");

const { connectDB } = require("../src/database.js");

beforeAll(async () => {
  await connectDB();
});

describe("Users API", () => {
  it("dummy test to ensure suite runs", () => {
    expect(true).toBe(true);
  });
});

describe("POST /users/", () => {
  it("returns 201 and creates a new user with valid data", async () => {
    const newUser = {
      username: "fastfeet",
      password: "StrongPassword!123",
      email: "runner@example.com",
      profile: {
        firstName: "Alex",
        lastName: "Miller",
        dateOfBirth: "1995-06-18",
        heightCm: 178,
        weightKg: 72,
      },
    };

    const res = await request(app).post("/users/").send(newUser);

    expect(res.statusCode).toBe(201);
    expect(res.headers["content-type"]).toMatch(/json/);
    expect(res.body).toHaveProperty("id");
  }, 10000);
});
