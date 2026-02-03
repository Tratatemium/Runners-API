const request = require("supertest");
const app = require("../../../src/app.js");
const { TEST_USERS, VALID_RUN_DATA } = require("../../helpers/test-data");
const { getAuthToken } = require("../../helpers/auth.helpers");
const {
  expect400WithMessage,
  expectJsonResponse,
} = require("../../helpers/assertions");
const {
  getAuthValidationTests,
  getContentTypeTests,
  getMissingFieldTests,
} = require("../../helpers/request.helpers");

describe("POST /users/me/runs", () => {
  let user1Token;

  beforeAll(async () => {
    user1Token = await getAuthToken({
      email: TEST_USERS.user1.email,
      password: TEST_USERS.user1.password,
    });
  });

  describe("Authentication", () => {
    getAuthValidationTests().forEach(({ name, setupAuth }) => {
      it(name, async () => {
        const req = request(app).post("/users/me/runs").send(VALID_RUN_DATA);
        const res = await setupAuth(req);

        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty("error");
      });
    });
  });

  describe("Content-Type validation", () => {
    getContentTypeTests().forEach(({ name, contentType, body }) => {
      it(name, async () => {
        const res = await request(app)
          .post("/users/me/runs")
          .set("Authorization", `Bearer ${user1Token}`)
          .set("Content-Type", contentType)
          .send(body);

        expect(res.statusCode).toBe(415);
        expect400WithMessage(res, "Content-Type must be json.");
      });
    });
  });

  describe("Required fields validation", () => {
    it("returns 400 for empty JSON", async () => {
      const res = await request(app)
        .post("/users/me/runs")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({});

      expect400WithMessage(
        res,
        "Run data is missing required fields: startTime, durationSec, distanceMeters."
      );
    });

    getMissingFieldTests(VALID_RUN_DATA, [
      "startTime",
      "durationSec",
      "distanceMeters",
    ]).forEach(({ name, data, field }) => {
      it(name, async () => {
        const res = await request(app)
          .post("/users/me/runs")
          .set("Authorization", `Bearer ${user1Token}`)
          .send(data);

        expect400WithMessage(
          res,
          `Run data is missing required fields: ${field}.`
        );
      });
    });

    it("returns 400 when field is null", async () => {
      const res = await request(app)
        .post("/users/me/runs")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({ ...VALID_RUN_DATA, startTime: null });

      expect400WithMessage(res, /startTime/);
    });
  });

  describe("Rejected fields validation", () => {
    it("userId in body is ignored and uses authenticated user's ID", async () => {
      const res = await request(app)
        .post("/users/me/runs")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({ ...VALID_RUN_DATA, userId: "some-other-uuid" });

      expectJsonResponse(res, 201);
      expect(res.body).toHaveProperty("id");
    });
  });

  describe("startTime validation", () => {
    const invalidStartTimeCases = [
      { value: 12345, message: "startTime must be a string." },
      { value: "2026-01-19 12:25:44", message: /ISO 8601/ },
      { value: "2026-02-30T12:25:44.822Z", message: /real calendar date/ },
      { value: "", message: /ISO 8601/ },
    ];

    invalidStartTimeCases.forEach(({ value, message }) => {
      it(`returns 400 for invalid startTime: ${JSON.stringify(value)}`, async () => {
        const res = await request(app)
          .post("/users/me/runs")
          .set("Authorization", `Bearer ${user1Token}`)
          .send({ ...VALID_RUN_DATA, startTime: value });

        expect400WithMessage(res, message);
      });
    });

    const validStartTimeCases = [
      { value: VALID_RUN_DATA.startTime, desc: "with milliseconds" },
      { value: "2026-01-19T12:25:44Z", desc: "without milliseconds" },
      { value: "  2024-01-15T10:30:00.000Z  ", desc: "with whitespace" },
    ];

    validStartTimeCases.forEach(({ value, desc }) => {
      it(`accepts valid ISO 8601 format ${desc}`, async () => {
        const res = await request(app)
          .post("/users/me/runs")
          .set("Authorization", `Bearer ${user1Token}`)
          .send({ ...VALID_RUN_DATA, startTime: value });

        expectJsonResponse(res, 201);
        expect(res.body).toHaveProperty("id");
      });
    });
  });

  describe("durationSec validation", () => {
    const invalidDurationCases = [
      { value: 0, message: "durationSec must be a positive number." },
      { value: -100, message: "durationSec must be a positive number." },
      { value: "not-a-number", message: "durationSec must be a positive number." },
    ];

    invalidDurationCases.forEach(({ value, message }) => {
      it(`returns 400 for invalid durationSec: ${value}`, async () => {
        const res = await request(app)
          .post("/users/me/runs")
          .set("Authorization", `Bearer ${user1Token}`)
          .send({ ...VALID_RUN_DATA, durationSec: value });

        expect400WithMessage(res, message);
      });
    });

    const validDurationCases = [
      { value: 1800, desc: "positive number" },
      { value: "1800", desc: "string number" },
      { value: "  1800  ", desc: "string with whitespace" },
      { value: 1800.5, desc: "decimal number" },
    ];

    validDurationCases.forEach(({ value, desc }) => {
      it(`accepts valid durationSec: ${desc}`, async () => {
        const res = await request(app)
          .post("/users/me/runs")
          .set("Authorization", `Bearer ${user1Token}`)
          .send({ ...VALID_RUN_DATA, durationSec: value });

        expectJsonResponse(res, 201);
        expect(res.body).toHaveProperty("id");
      });
    });
  });

  describe("distanceMeters validation", () => {
    const invalidDistanceCases = [
      { value: 0, message: "distanceMeters must be a positive number." },
      { value: -5000, message: "distanceMeters must be a positive number." },
      { value: "invalid", message: "distanceMeters must be a positive number." },
    ];

    invalidDistanceCases.forEach(({ value, message }) => {
      it(`returns 400 for invalid distanceMeters: ${value}`, async () => {
        const res = await request(app)
          .post("/users/me/runs")
          .set("Authorization", `Bearer ${user1Token}`)
          .send({ ...VALID_RUN_DATA, distanceMeters: value });

        expect400WithMessage(res, message);
      });
    });

    const validDistanceCases = [
      { value: 5000, desc: "positive number" },
      { value: "5000", desc: "string number" },
      { value: "  5000  ", desc: "string with whitespace" },
      { value: 5000.5, desc: "decimal number" },
    ];

    validDistanceCases.forEach(({ value, desc }) => {
      it(`accepts valid distanceMeters: ${desc}`, async () => {
        const res = await request(app)
          .post("/users/me/runs")
          .set("Authorization", `Bearer ${user1Token}`)
          .send({ ...VALID_RUN_DATA, distanceMeters: value });

        expectJsonResponse(res, 201);
        expect(res.body).toHaveProperty("id");
      });
    });
  });

  describe("Successful validation", () => {
    it("returns 201 for valid run data", async () => {
      const res = await request(app)
        .post("/users/me/runs")
        .set("Authorization", `Bearer ${user1Token}`)
        .send(VALID_RUN_DATA);

      expectJsonResponse(res, 201);
      expect(res.body).toHaveProperty("id");
    });

    it("handles data with whitespace and string numbers", async () => {
      const res = await request(app)
        .post("/users/me/runs")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({
          startTime: "  2024-01-15T10:30:00.000Z  ",
          durationSec: "  1800  ",
          distanceMeters: "  5000  ",
        });

      expectJsonResponse(res, 201);
      expect(res.body).toHaveProperty("id");
    });
  });
});

describe("GET /users/me/runs", () => {
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

  describe("Authentication", () => {
    getAuthValidationTests().forEach(({ name, setupAuth }) => {
      it(name, async () => {
        const req = request(app).get("/users/me/runs");
        const res = await setupAuth(req);

        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty("error");
      });
    });
  });

  describe("Successful retrieval", () => {
    it("returns 200 and an array of runs for user1 (has multiple runs)", async () => {
      const res = await request(app)
        .get("/users/me/runs")
        .set("Authorization", `Bearer ${user1Token}`);

      expectJsonResponse(res, 200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);

      // Verify all returned runs belong to user1
      res.body.forEach((run) => {
        expect(run).toHaveProperty("userId", TEST_USERS.user1.userId);
      });
    });

    it("returns 200 and an array of runs for user2", async () => {
      const res = await request(app)
        .get("/users/me/runs")
        .set("Authorization", `Bearer ${user2Token}`);

      expectJsonResponse(res, 200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);

      res.body.forEach((run) => {
        expect(run).toHaveProperty("userId", TEST_USERS.user2.userId);
      });
    });

    it("returns only the authenticated user's runs, not other users' runs", async () => {
      const res1 = await request(app)
        .get("/users/me/runs")
        .set("Authorization", `Bearer ${user1Token}`);

      const res2 = await request(app)
        .get("/users/me/runs")
        .set("Authorization", `Bearer ${user2Token}`);

      expect(res1.statusCode).toBe(200);
      expect(res2.statusCode).toBe(200);

      res1.body.forEach((run) => {
        expect(run.userId).toBe(TEST_USERS.user1.userId);
        expect(run.userId).not.toBe(TEST_USERS.user2.userId);
      });

      res2.body.forEach((run) => {
        expect(run.userId).toBe(TEST_USERS.user2.userId);
        expect(run.userId).not.toBe(TEST_USERS.user1.userId);
      });

      expect(res1.body).not.toEqual(res2.body);
    });

    it("returns empty array for user with no runs", async () => {
      const newUser = {
        username: "runner_no_runs",
        password: "NoRunsPass123!",
        email: "noruns@test.com",
      };

      await request(app).post("/auth/signup").send(newUser);

      const noRunsToken = await getAuthToken({
        email: newUser.email,
        password: newUser.password,
      });

      const res = await request(app)
        .get("/users/me/runs")
        .set("Authorization", `Bearer ${noRunsToken}`);

      expectJsonResponse(res, 200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
    });
  });
});
