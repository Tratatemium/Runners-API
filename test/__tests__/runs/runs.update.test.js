const request = require("supertest");
const app = require("../../../src/app.js");
const { TEST_USERS, TEST_RUN_IDS } = require("../../helpers/test-data");
const { getAuthToken } = require("../../helpers/auth.helpers");
const {
  expect400WithMessage,
  expect403Error,
  expect404Error,
  expectValidRunStructure,
  expectJsonResponse,
  expect415Error,
} = require("../../helpers/assertions");
const { getAuthValidationTests } = require("../../helpers/request.helpers");

describe("PATCH /api/v1/runs/:id", () => {
  let user1Token;
  let user2Token;
  let adminToken;

  beforeAll(async () => {
    user1Token = await getAuthToken({
      email: TEST_USERS.user1.email,
      password: TEST_USERS.user1.password,
    });
    user2Token = await getAuthToken({
      email: TEST_USERS.user2.email,
      password: TEST_USERS.user2.password,
    });
    adminToken = await getAuthToken({
      email: TEST_USERS.admin.email,
      password: TEST_USERS.admin.password,
    });
  });

  describe("Authentication", () => {
    getAuthValidationTests().forEach(({ name, setupAuth }) => {
      it(name, async () => {
        const runId = TEST_RUN_IDS.user1Run1;
        const req = request(app).patch(`/api/v1/runs/${runId}`).send({
          durationSec: 2000,
        });
        const res = await setupAuth(req);

        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty("error");
      });
    });
  });

  describe("Authorization (permissions)", () => {
    it("returns 403 when user tries to update another user's run", async () => {
      const user1RunId = TEST_RUN_IDS.user1Run1;
      const res = await request(app)
        .patch(`/api/v1/runs/${user1RunId}`)
        .set("Authorization", `Bearer ${user2Token}`)
        .send({
          durationSec: 2500,
        });

      expect403Error(res);
    });

    it("returns 403 with appropriate error message for permission denial", async () => {
      const user1RunId = TEST_RUN_IDS.user1Run1;
      const res = await request(app)
        .patch(`/api/v1/runs/${user1RunId}`)
        .set("Authorization", `Bearer ${user2Token}`)
        .send({
          distanceMeters: 6000,
        });

      expect403Error(res);
      expect(res.body.error).toMatch(/not allowed/i);
    });
  });

  describe("Owner permissions", () => {
    it("allows owner to update their own run", async () => {
      // Create a run as user1
      const createRes = await request(app)
        .post("/api/v1/users/me/runs")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({
          startTime: "2026-02-03T10:00:00.000Z",
          durationSec: 1800,
          distanceMeters: 5000,
        });

      const newRunId = createRes.body.data.runId;

      // Update it as owner
      const updateRes = await request(app)
        .patch(`/api/v1/runs/${newRunId}`)
        .set("Authorization", `Bearer ${user1Token}`)
        .send({
          durationSec: 2000,
        });

      expectJsonResponse(updateRes, 200);
      expect(updateRes.body.status).toBe("success");
      expect(updateRes.body.data).toHaveProperty("durationSec", 2000);
    });

    it("owner can update multiple fields at once", async () => {
      // Create a run as user2
      const createRes = await request(app)
        .post("/api/v1/users/me/runs")
        .set("Authorization", `Bearer ${user2Token}`)
        .send({
          startTime: "2026-02-03T11:00:00.000Z",
          durationSec: 1500,
          distanceMeters: 4000,
        });

      const newRunId = createRes.body.data.runId;

      // Update multiple fields
      const updateRes = await request(app)
        .patch(`/api/v1/runs/${newRunId}`)
        .set("Authorization", `Bearer ${user2Token}`)
        .send({
          durationSec: 1800,
          distanceMeters: 5000,
        });

      expectJsonResponse(updateRes, 200);
      expect(updateRes.body.data).toHaveProperty("durationSec", 1800);
      expect(updateRes.body.data).toHaveProperty("distanceMeters", 5000);
    });

    it("owner can update startTime", async () => {
      // Create a run as user1
      const createRes = await request(app)
        .post("/api/v1/users/me/runs")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({
          startTime: "2026-02-03T12:00:00.000Z",
          durationSec: 1200,
          distanceMeters: 3000,
        });

      const newRunId = createRes.body.data.runId;

      // Update startTime
      const newStartTime = "2026-02-03T13:00:00.000Z";
      const updateRes = await request(app)
        .patch(`/api/v1/runs/${newRunId}`)
        .set("Authorization", `Bearer ${user1Token}`)
        .send({
          startTime: newStartTime,
        });

      expectJsonResponse(updateRes, 200);
      expect(updateRes.body.data).toHaveProperty("startTime", newStartTime);
    });

    it("updated run maintains valid structure", async () => {
      // Create a run
      const createRes = await request(app)
        .post("/api/v1/users/me/runs")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({
          startTime: "2026-02-03T14:00:00.000Z",
          durationSec: 900,
          distanceMeters: 2500,
        });

      const newRunId = createRes.body.data.runId;

      // Update it
      const updateRes = await request(app)
        .patch(`/api/v1/runs/${newRunId}`)
        .set("Authorization", `Bearer ${user1Token}`)
        .send({
          distanceMeters: 3000,
        });

      expectJsonResponse(updateRes, 200);
      expectValidRunStructure(updateRes.body.data);
    });

    it("owner update persists in database", async () => {
      // Create a run
      const createRes = await request(app)
        .post("/api/v1/users/me/runs")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({
          startTime: "2026-02-03T14:30:00.000Z",
          durationSec: 1000,
          distanceMeters: 2800,
        });

      const newRunId = createRes.body.data.runId;

      // Update it
      await request(app)
        .patch(`/api/v1/runs/${newRunId}`)
        .set("Authorization", `Bearer ${user1Token}`)
        .send({
          distanceMeters: 3100,
        });

      // Verify the update persisted
      const getRes = await request(app).get(`/api/v1/runs/${newRunId}`);

      expectJsonResponse(getRes, 200);
      expect(getRes.body.data).toHaveProperty("distanceMeters", 3100);
    });
  });

  describe("Admin permissions", () => {
    it("allows admin to update another user's run", async () => {
      // Create a run as user1
      const createRes = await request(app)
        .post("/api/v1/users/me/runs")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({
          startTime: "2026-02-03T15:00:00.000Z",
          durationSec: 1600,
          distanceMeters: 4500,
        });

      const newRunId = createRes.body.data.runId;

      // Update it as admin
      const updateRes = await request(app)
        .patch(`/api/v1/runs/${newRunId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          durationSec: 1800,
        });

      expectJsonResponse(updateRes, 200);
      expect(updateRes.body.status).toBe("success");
      expect(updateRes.body.data).toHaveProperty("durationSec", 1800);
    });

    it("admin can update multiple fields of another user's run", async () => {
      // Create a run as user2
      const createRes = await request(app)
        .post("/api/v1/users/me/runs")
        .set("Authorization", `Bearer ${user2Token}`)
        .send({
          startTime: "2026-02-03T16:00:00.000Z",
          durationSec: 2000,
          distanceMeters: 5500,
        });

      const newRunId = createRes.body.data.runId;

      // Admin updates multiple fields
      const updateRes = await request(app)
        .patch(`/api/v1/runs/${newRunId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          startTime: "2026-02-03T17:00:00.000Z",
          durationSec: 2200,
          distanceMeters: 6000,
        });

      expectJsonResponse(updateRes, 200);
      expect(updateRes.body.data).toHaveProperty(
        "startTime",
        "2026-02-03T17:00:00.000Z",
      );
      expect(updateRes.body.data).toHaveProperty("durationSec", 2200);
      expect(updateRes.body.data).toHaveProperty("distanceMeters", 6000);
    });

    it("admin update maintains valid run structure", async () => {
      // Create a run as user1
      const createRes = await request(app)
        .post("/api/v1/users/me/runs")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({
          startTime: "2026-02-03T18:00:00.000Z",
          durationSec: 1400,
          distanceMeters: 3800,
        });

      const newRunId = createRes.body.data.runId;

      // Admin updates it
      const updateRes = await request(app)
        .patch(`/api/v1/runs/${newRunId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          distanceMeters: 4000,
        });

      expectJsonResponse(updateRes, 200);
      expectValidRunStructure(updateRes.body.data);
    });

    it("admin update persists in database", async () => {
      // Create a run as user2
      const createRes = await request(app)
        .post("/api/v1/users/me/runs")
        .set("Authorization", `Bearer ${user2Token}`)
        .send({
          startTime: "2026-02-03T19:00:00.000Z",
          durationSec: 1100,
          distanceMeters: 3200,
        });

      const newRunId = createRes.body.data.runId;

      // Admin updates it
      await request(app)
        .patch(`/api/v1/runs/${newRunId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          durationSec: 1300,
        });

      // Verify the update persisted
      const getRes = await request(app).get(`/api/v1/runs/${newRunId}`);

      expectJsonResponse(getRes, 200);
      expect(getRes.body.data).toHaveProperty("durationSec", 1300);
    });
  });

  describe("Validation", () => {
    it("returns 415 when Content-Type is not application/json", async () => {
      const runId = TEST_RUN_IDS.user1Run1;
      const res = await request(app)
        .patch(`/api/v1/runs/${runId}`)
        .set("Authorization", `Bearer ${user1Token}`)
        .set("Content-Type", "text/plain")
        .send("durationSec=2000");

      expect415Error(res);
    });

    const invalidIdCases = [
      { id: "not-a-uuid", desc: "invalid UUID format" },
      { id: "000000zdg000000000000000000", desc: "malformed UUID" },
    ];

    invalidIdCases.forEach(({ id, desc }) => {
      it(`returns 404 for ${desc}`, async () => {
        const res = await request(app)
          .patch(`/api/v1/runs/${id}`)
          .set("Authorization", `Bearer ${user1Token}`)
          .send({
            durationSec: 2000,
          });

        expect404Error(res);
      });
    });

    it("returns 404 when updating non-existent run", async () => {
      const nonExistentId = TEST_RUN_IDS.nonExistent;
      const res = await request(app)
        .patch(`/api/v1/runs/${nonExistentId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          durationSec: 2000,
        });

      expect404Error(res);
    });

    it("returns 400 when updating with empty body", async () => {
      const runId = TEST_RUN_IDS.user1Run1;
      const res = await request(app)
        .patch(`/api/v1/runs/${runId}`)
        .set("Authorization", `Bearer ${user1Token}`)
        .send({});

      expect400WithMessage(res, /must have one of the required fields/i);
    });

    it("returns 400 when updating with unknown fields", async () => {
      // Create a run
      const createRes = await request(app)
        .post("/api/v1/users/me/runs")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({
          startTime: "2026-02-03T23:00:00.000Z",
          durationSec: 1500,
          distanceMeters: 4000,
        });

      const newRunId = createRes.body.data.runId;

      const res = await request(app)
        .patch(`/api/v1/runs/${newRunId}`)
        .set("Authorization", `Bearer ${user1Token}`)
        .send({
          durationSec: 1600,
          unknownField: "value",
        });

      expect400WithMessage(res, /unknown|allowed/i);
    });

    const invalidDurationCases = [
      { value: 0, desc: "zero value" },
      { value: -100, desc: "negative value" },
      { value: "not-a-number", desc: "non-numeric string" },
    ];

    invalidDurationCases.forEach(({ value, desc }) => {
      it(`returns 400 for invalid durationSec: ${desc}`, async () => {
        const createRes = await request(app)
          .post("/api/v1/users/me/runs")
          .set("Authorization", `Bearer ${user1Token}`)
          .send({
            startTime: "2026-02-03T20:00:00.000Z",
            durationSec: 1500,
            distanceMeters: 4000,
          });

        const newRunId = createRes.body.data.runId;

        const res = await request(app)
          .patch(`/api/v1/runs/${newRunId}`)
          .set("Authorization", `Bearer ${user1Token}`)
          .send({
            durationSec: value,
          });

        expect400WithMessage(res, /positive/i);
      });
    });

    const invalidDistanceCases = [
      { value: 0, desc: "zero value" },
      { value: -5000, desc: "negative value" },
      { value: "invalid", desc: "non-numeric string" },
    ];

    invalidDistanceCases.forEach(({ value, desc }) => {
      it(`returns 400 for invalid distanceMeters: ${desc}`, async () => {
        const createRes = await request(app)
          .post("/api/v1/users/me/runs")
          .set("Authorization", `Bearer ${user1Token}`)
          .send({
            startTime: "2026-02-03T21:00:00.000Z",
            durationSec: 1500,
            distanceMeters: 4000,
          });

        const newRunId = createRes.body.data.runId;

        const res = await request(app)
          .patch(`/api/v1/runs/${newRunId}`)
          .set("Authorization", `Bearer ${user1Token}`)
          .send({
            distanceMeters: value,
          });

        expect400WithMessage(res, /positive/i);
      });
    });

    const invalidStartTimeCases = [
      { value: "invalid-date", desc: "invalid date format" },
      { value: "2026-02-30T12:25:44.822Z", desc: "invalid calendar date" },
      { value: "", desc: "empty string" },
    ];

    invalidStartTimeCases.forEach(({ value, desc }) => {
      it(`returns 400 for invalid startTime: ${desc}`, async () => {
        const createRes = await request(app)
          .post("/api/v1/users/me/runs")
          .set("Authorization", `Bearer ${user1Token}`)
          .send({
            startTime: "2026-02-03T22:00:00.000Z",
            durationSec: 1500,
            distanceMeters: 4000,
          });

        const newRunId = createRes.body.data.runId;

        const res = await request(app)
          .patch(`/api/v1/runs/${newRunId}`)
          .set("Authorization", `Bearer ${user1Token}`)
          .send({
            startTime: value,
          });

        expect400WithMessage(res, /iso|real calendar date/i);
      });
    });
  });

  describe("Response format", () => {
    it("returns updated run data in standard success format", async () => {
      // Create a run
      const createRes = await request(app)
        .post("/api/v1/users/me/runs")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({
          startTime: "2026-02-04T08:00:00.000Z",
          durationSec: 1800,
          distanceMeters: 5000,
        });

      const newRunId = createRes.body.data.runId;

      // Update it
      const res = await request(app)
        .patch(`/api/v1/runs/${newRunId}`)
        .set("Authorization", `Bearer ${user1Token}`)
        .send({
          durationSec: 2000,
        });

      expectJsonResponse(res, 200);
      expect(res.body).toHaveProperty("status", "success");
      expect(res.body).toHaveProperty("data");
      expect(res.body.data).toBeInstanceOf(Object);
    });

    it("returns all run fields in response", async () => {
      // Create a run
      const createRes = await request(app)
        .post("/api/v1/users/me/runs")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({
          startTime: "2026-02-04T09:00:00.000Z",
          durationSec: 1600,
          distanceMeters: 4500,
        });

      const newRunId = createRes.body.data.runId;

      // Update one field
      const res = await request(app)
        .patch(`/api/v1/runs/${newRunId}`)
        .set("Authorization", `Bearer ${user1Token}`)
        .send({
          durationSec: 1700,
        });

      expectJsonResponse(res, 200);
      expect(res.body.data).toHaveProperty("runId");
      expect(res.body.data).toHaveProperty("userId");
      expect(res.body.data).toHaveProperty("startTime");
      expect(res.body.data).toHaveProperty("durationSec");
      expect(res.body.data).toHaveProperty("distanceMeters");
    });

    it("preserves unchanged fields in response", async () => {
      // Create a run
      const originalStartTime = "2026-02-04T10:00:00.000Z";
      const originalDistance = 5200;
      const createRes = await request(app)
        .post("/api/v1/users/me/runs")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({
          startTime: originalStartTime,
          durationSec: 1700,
          distanceMeters: originalDistance,
        });

      const newRunId = createRes.body.data.runId;

      // Update only duration
      const res = await request(app)
        .patch(`/api/v1/runs/${newRunId}`)
        .set("Authorization", `Bearer ${user1Token}`)
        .send({
          durationSec: 1900,
        });

      expectJsonResponse(res, 200);
      expect(res.body.data).toHaveProperty("durationSec", 1900);
      expect(res.body.data).toHaveProperty("startTime", originalStartTime);
      expect(res.body.data).toHaveProperty("distanceMeters", originalDistance);
    });
  });
});
