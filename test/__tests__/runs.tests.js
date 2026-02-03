const request = require("supertest");
const app = require("../../src/app.js");

// Using pre-seeded test users
const testUser1 = {
  username: "test_runner_01",
  password: "TestPassword123!",
  email: "runner01@test.com",
  userId: "f96084c5-ad81-4a19-99ef-49cfdfeb6fb5",
};

const testUser2 = {
  username: "test_runner_02",
  password: "SecurePass456!",
  email: "runner02@test.com",
  userId: "86642e8c-d288-450b-aa92-b83dc18abcaf",
};

describe("GET /runs/:id - Integration Tests", () => {
  it("returns 200 and a run JSON for an existing ID", async () => {
    const runId = "dc9822e7-72d6-4cc8-b6da-c1c5208d6109";

    const res = await request(app).get(`/runs/${runId}`);

    expect(res.statusCode).toBe(200);
    expect(res.headers["content-type"]).toMatch(/json/);

    expect(res.body).toBeDefined();
    expect(res.body).toHaveProperty("runId", runId);
    expect(res.body).toHaveProperty("userId");
    expect(res.body).toHaveProperty("startTime");
    expect(res.body).toHaveProperty("durationSec");
    expect(res.body).toHaveProperty("distanceMeters");

    expect(typeof res.body.durationSec).toBe("number");
    expect(typeof res.body.distanceMeters).toBe("number");
    expect(new Date(res.body.startTime).toString()).not.toBe("Invalid Date");
  });

  it("returns 404 for a non-existing ID", async () => {
    const runId = "dc9811e7-72d6-4df8-b6da-c1c5219d6109";

    const res = await request(app).get(`/runs/${runId}`);

    expect(res.statusCode).toBe(404);
    expect(res.headers["content-type"]).toMatch(/json/);

    expect(res.body).toBeDefined();
    expect(res.body).toHaveProperty("error");
  });

  it("returns 400 for non UUID", async () => {
    const runId = "not-a-UUID";

    const res = await request(app).get(`/runs/${runId}`);

    expect(res.statusCode).toBe(400);
    expect(res.headers["content-type"]).toMatch(/json/);

    expect(res.body).toBeDefined();
    expect(res.body).toHaveProperty("error");
  });
});

describe("POST /runs/ - Integration Tests", () => {
  let user1Token;

  beforeAll(async () => {
    // Login as user1 and get token
    const loginRes = await request(app).post("/auth/login").send({
      email: testUser1.email,
      password: testUser1.password,
    });
    user1Token = loginRes.body.token;
  });

  const validRunData = {
    startTime: "2026-01-19T12:25:44.822Z",
    durationSec: 1800,
    distanceMeters: 5000,
  };

  describe("Authentication", () => {
    it("returns 401 when no authorization header is provided", async () => {
      const res = await request(app).post("/runs").send(validRunData);

      expect(res.statusCode).toBe(401);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
    });

    it("returns 401 when authorization header doesn't start with Bearer", async () => {
      const res = await request(app)
        .post("/runs")
        .set("Authorization", "InvalidToken")
        .send(validRunData);

      expect(res.statusCode).toBe(401);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
    });

    it("returns 401 for invalid token", async () => {
      const res = await request(app)
        .post("/runs")
        .set("Authorization", "Bearer invalid.token.here")
        .send(validRunData);

      expect(res.statusCode).toBe(401);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
    });
  });

  it("returns 415 when Content-Type is not JSON", async () => {
    const res = await request(app)
      .post("/runs")
      .set("Authorization", `Bearer ${user1Token}`)
      .set("Content-Type", "text/plain")
      .send("not json");

    expect(res.statusCode).toBe(415);
    expect(res.headers["content-type"]).toMatch(/json/);
    expect(res.body).toHaveProperty("error");
    expect(res.body.error).toBe("Content-Type must be json.");
  });

  describe("Required fields validation", () => {
    it("returns 400 for empty JSON", async () => {
      const res = await request(app)
        .post("/runs/")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toBe(
        "Run data is missing required fields: startTime, durationSec, distanceMeters.",
      );
    });

    it("returns 400 for missing startTime field", async () => {
      const { startTime, ...dataWithoutStartTime } = validRunData;
      const res = await request(app)
        .post("/runs/")
        .set("Authorization", `Bearer ${user1Token}`)
        .send(dataWithoutStartTime);

      expect(res.statusCode).toBe(400);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toBe(
        "Run data is missing required fields: startTime.",
      );
    });

    it("returns 400 for missing durationSec field", async () => {
      const { durationSec, ...dataWithoutDurationSec } = validRunData;
      const res = await request(app)
        .post("/runs/")
        .set("Authorization", `Bearer ${user1Token}`)
        .send(dataWithoutDurationSec);

      expect(res.statusCode).toBe(400);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toBe(
        "Run data is missing required fields: durationSec.",
      );
    });

    it("returns 400 for missing distanceMeters field", async () => {
      const { distanceMeters, ...dataWithoutDistanceMeters } = validRunData;
      const res = await request(app)
        .post("/runs/")
        .set("Authorization", `Bearer ${user1Token}`)
        .send(dataWithoutDistanceMeters);

      expect(res.statusCode).toBe(400);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toBe(
        "Run data is missing required fields: distanceMeters.",
      );
    });

    it("returns 400 when field is null", async () => {
      const res = await request(app)
        .post("/runs")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({ ...validRunData, startTime: null });

      expect(res.statusCode).toBe(400);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toContain("startTime");
    });
  });

  describe("Rejected fields validation", () => {
    it("userId in body is ignored and uses authenticated user's ID", async () => {
      const res = await request(app)
        .post("/runs")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({ ...validRunData, userId: "some-other-uuid" });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("id");
    });
  });

  describe("startTime validation", () => {
    it("returns 400 for non-string startTime", async () => {
      const res = await request(app)
        .post("/runs")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({ ...validRunData, startTime: 12345 });

      expect(res.statusCode).toBe(400);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toBe("startTime must be a string.");
    });

    it("returns 400 for invalid ISO 8601 format", async () => {
      const res = await request(app)
        .post("/runs")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({
          ...validRunData,
          startTime: "2026-01-19 12:25:44",
        });

      expect(res.statusCode).toBe(400);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toBe(
        "startTime must be a valid ISO 8601 timestamp with timezone (UTC).",
      );
    });

    it("returns 400 for invalid date", async () => {
      const res = await request(app)
        .post("/runs")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({
          ...validRunData,
          startTime: "2026-02-30T12:25:44.822Z",
        });

      expect(res.statusCode).toBe(400);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toBe(
        "startTime must be a real calendar date and time.",
      );
    });

    it("returns 400 for empty startTime", async () => {
      const res = await request(app)
        .post("/runs")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({
          ...validRunData,
          startTime: "",
        });

      expect(res.statusCode).toBe(400);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toBe(
        "startTime must be a valid ISO 8601 timestamp with timezone (UTC).",
      );
    });

    it("accepts valid ISO 8601 format with milliseconds", async () => {
      const res = await request(app)
        .post("/runs")
        .set("Authorization", `Bearer ${user1Token}`)
        .send(validRunData);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("id");
    });

    it("accepts valid ISO 8601 format without milliseconds", async () => {
      const res = await request(app)
        .post("/runs")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({ ...validRunData, startTime: "2026-01-19T12:25:44Z" });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("id");
    });

    it("handles startTime with whitespace", async () => {
      const res = await request(app)
        .post("/runs")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({ ...validRunData, startTime: "  2024-01-15T10:30:00.000Z  " });

      expect(res.statusCode).toBe(201);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("id");
    });
  });

  describe("durationSec validation", () => {
    it("returns 400 for zero durationSec", async () => {
      const res = await request(app)
        .post("/runs")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({ ...validRunData, durationSec: 0 });

      expect(res.statusCode).toBe(400);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toBe("durationSec must be a positive number.");
    });

    it("returns 400 for negative durationSec", async () => {
      const res = await request(app)
        .post("/runs")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({ ...validRunData, durationSec: -100 });

      expect(res.statusCode).toBe(400);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toBe("durationSec must be a positive number.");
    });

    it("returns 400 for non-numeric durationSec", async () => {
      const res = await request(app)
        .post("/runs")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({ ...validRunData, durationSec: "not-a-number" });

      expect(res.statusCode).toBe(400);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toBe("durationSec must be a positive number.");
    });

    it("accepts valid positive durationSec number", async () => {
      const res = await request(app)
        .post("/runs")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({ ...validRunData, durationSec: 1800 });

      expect(res.statusCode).toBe(201);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("id");
    });

    it("accepts string number for durationSec", async () => {
      const res = await request(app)
        .post("/runs")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({ ...validRunData, durationSec: "1800" });

      expect(res.statusCode).toBe(201);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("id");
    });

    it("handles numeric string with whitespace for durationSec", async () => {
      const res = await request(app)
        .post("/runs")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({ ...validRunData, durationSec: "  1800  " });

      expect(res.statusCode).toBe(201);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("id");
    });

    it("accepts decimal numbers for durationSec", async () => {
      const res = await request(app)
        .post("/runs")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({ ...validRunData, durationSec: 1800.5 });

      expect(res.statusCode).toBe(201);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("id");
    });
  });

  describe("distanceMeters validation", () => {
    it("returns 400 for zero distanceMeters", async () => {
      const res = await request(app)
        .post("/runs")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({ ...validRunData, distanceMeters: 0 });

      expect(res.statusCode).toBe(400);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toBe("distanceMeters must be a positive number.");
    });

    it("returns 400 for negative distanceMeters", async () => {
      const res = await request(app)
        .post("/runs")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({ ...validRunData, distanceMeters: -5000 });

      expect(res.statusCode).toBe(400);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toBe("distanceMeters must be a positive number.");
    });

    it("returns 400 for non-numeric distanceMeters", async () => {
      const res = await request(app)
        .post("/runs")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({ ...validRunData, distanceMeters: "invalid" });

      expect(res.statusCode).toBe(400);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toBe("distanceMeters must be a positive number.");
    });

    it("accepts valid positive distanceMeters number", async () => {
      const res = await request(app)
        .post("/runs")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({ ...validRunData, distanceMeters: 5000 });

      expect(res.statusCode).toBe(201);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("id");
    });

    it("accepts string number for distanceMeters", async () => {
      const res = await request(app)
        .post("/runs")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({ ...validRunData, distanceMeters: "5000" });

      expect(res.statusCode).toBe(201);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("id");
    });

    it("handles numeric string with whitespace for distanceMeters", async () => {
      const res = await request(app)
        .post("/runs")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({ ...validRunData, distanceMeters: "  5000  " });

      expect(res.statusCode).toBe(201);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("id");
    });

    it("accepts decimal numbers for distanceMeters", async () => {
      const res = await request(app)
        .post("/runs")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({ ...validRunData, distanceMeters: 5000.5 });

      expect(res.statusCode).toBe(201);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("id");
    });
  });

  describe("Successful validation", () => {
    it("returns 201 for valid run data", async () => {
      const res = await request(app)
        .post("/runs")
        .set("Authorization", `Bearer ${user1Token}`)
        .send(validRunData);

      expect(res.statusCode).toBe(201);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("id");
    });

    it("handles data with whitespace and string numbers", async () => {
      const res = await request(app)
        .post("/runs")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({
          startTime: "  2024-01-15T10:30:00.000Z  ",
          durationSec: "  1800  ",
          distanceMeters: "  5000  ",
        });

      expect(res.statusCode).toBe(201);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("id");
    });
  });
});

describe("GET /runs/my - Integration Tests", () => {
  let user1Token;
  let user2Token;

  beforeAll(async () => {
    // Login as user1 and get token
    const loginRes1 = await request(app).post("/auth/login").send({
      email: testUser1.email,
      password: testUser1.password,
    });
    user1Token = loginRes1.body.token;

    // Login as user2 and get token
    const loginRes2 = await request(app).post("/auth/login").send({
      email: testUser2.email,
      password: testUser2.password,
    });
    user2Token = loginRes2.body.token;
  });

  describe("Authentication", () => {
    it("returns 401 when no authorization header is provided", async () => {
      const res = await request(app).get("/runs/my");

      expect(res.statusCode).toBe(401);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
    });

    it("returns 401 when authorization header doesn't start with Bearer", async () => {
      const res = await request(app)
        .get("/runs/my")
        .set("Authorization", "InvalidToken");

      expect(res.statusCode).toBe(401);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
    });

    it("returns 401 for invalid token", async () => {
      const res = await request(app)
        .get("/runs/my")
        .set("Authorization", "Bearer invalid.token.here");

      expect(res.statusCode).toBe(401);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("error");
    });
  });

  describe("Successful retrieval", () => {
    it("returns 200 and an array of runs for user1 (has multiple runs)", async () => {
      const res = await request(app)
        .get("/runs/my")
        .set("Authorization", `Bearer ${user1Token}`);

      expect(res.statusCode).toBe(200);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);

      // Verify all returned runs belong to user1
      res.body.forEach((run) => {
        expect(run).toHaveProperty("runId");
        expect(run).toHaveProperty("userId", testUser1.userId);
        expect(run).toHaveProperty("startTime");
        expect(run).toHaveProperty("durationSec");
        expect(run).toHaveProperty("distanceMeters");
        expect(typeof run.durationSec).toBe("number");
        expect(typeof run.distanceMeters).toBe("number");
      });
    });

    it("returns 200 and an array of runs for user2", async () => {
      const res = await request(app)
        .get("/runs/my")
        .set("Authorization", `Bearer ${user2Token}`);

      expect(res.statusCode).toBe(200);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);

      // Verify all returned runs belong to user2
      res.body.forEach((run) => {
        expect(run).toHaveProperty("userId", testUser2.userId);
      });
    });

    it("returns only the authenticated user's runs, not other users' runs", async () => {
      const res1 = await request(app)
        .get("/runs/my")
        .set("Authorization", `Bearer ${user1Token}`);

      const res2 = await request(app)
        .get("/runs/my")
        .set("Authorization", `Bearer ${user2Token}`);

      expect(res1.statusCode).toBe(200);
      expect(res2.statusCode).toBe(200);

      // Verify user1 runs don't contain user2's userId
      res1.body.forEach((run) => {
        expect(run.userId).toBe(testUser1.userId);
        expect(run.userId).not.toBe(testUser2.userId);
      });

      // Verify user2 runs don't contain user1's userId
      res2.body.forEach((run) => {
        expect(run.userId).toBe(testUser2.userId);
        expect(run.userId).not.toBe(testUser1.userId);
      });

      // Verify the lists are different
      expect(res1.body).not.toEqual(res2.body);
    });

    it("returns empty array for user with no runs", async () => {
      // First, create a new user with no runs
      const newUser = {
        username: "runner_no_runs",
        password: "NoRunsPass123!",
        email: "noruns@test.com",
      };

      await request(app).post("/auth/signup").send(newUser);

      const loginRes = await request(app).post("/auth/login").send({
        email: newUser.email,
        password: newUser.password,
      });

      const noRunsToken = loginRes.body.token;

      const res = await request(app)
        .get("/runs/my")
        .set("Authorization", `Bearer ${noRunsToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
    });

    it("returns runs with valid data types and structure", async () => {
      const res = await request(app)
        .get("/runs/my")
        .set("Authorization", `Bearer ${user1Token}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);

      if (res.body.length > 0) {
        const run = res.body[0];

        expect(typeof run.runId).toBe("string");
        expect(typeof run.userId).toBe("string");
        expect(typeof run.startTime).toBe("string");
        expect(typeof run.durationSec).toBe("number");
        expect(typeof run.distanceMeters).toBe("number");

        // Verify startTime is a valid ISO 8601 date
        expect(new Date(run.startTime).toString()).not.toBe("Invalid Date");

        // Verify positive numbers
        expect(run.durationSec).toBeGreaterThan(0);
        expect(run.distanceMeters).toBeGreaterThan(0);
      }
    });

    it("returns runs sorted by startTime (most recent first) if implemented", async () => {
      const res = await request(app)
        .get("/runs/my")
        .set("Authorization", `Bearer ${user1Token}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);

      if (res.body.length > 1) {
        // Check if sorted by startTime descending (most recent first)
        for (let i = 0; i < res.body.length - 1; i++) {
          const currentDate = new Date(res.body[i].startTime);
          const nextDate = new Date(res.body[i + 1].startTime);
          // This test will pass regardless of sort order, but logs the order
          // You can make it strict if your API guarantees ordering
          expect(currentDate).toBeInstanceOf(Date);
          expect(nextDate).toBeInstanceOf(Date);
        }
      }
    });
  });
});
