const request = require("supertest");
const app = require("../../../src/app.js");
const { TEST_USERS, TEST_RUN_IDS } = require("../../helpers/test-data");
const { getAuthToken } = require("../../helpers/auth.helpers");
const {
  expect400WithMessage,
  expect403Error,
  expect404Error,
} = require("../../helpers/assertions");
const { getAuthValidationTests } = require("../../helpers/request.helpers");

describe("DELETE /api/v1/runs/:id", () => {
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
        const req = request(app).delete(`/api/v1/runs/${runId}`);
        const res = await setupAuth(req);

        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty("error");
      });
    });
  });

  describe("Authorization (permissions)", () => {
    it("returns 403 when user tries to delete another user's run", async () => {
      const user1RunId = TEST_RUN_IDS.user1Run1;
      const res = await request(app)
        .delete(`/api/v1/runs/${user1RunId}`)
        .set("Authorization", `Bearer ${user2Token}`);

      expect403Error(res);
    });

    it("returns 403 with appropriate error message for permission denial", async () => {
      const user1RunId = TEST_RUN_IDS.user1Run1;
      const res = await request(app)
        .delete(`/api/v1/runs/${user1RunId}`)
        .set("Authorization", `Bearer ${user2Token}`);

      expect403Error(res);
      expect(res.body.error).toMatch(/not allowed/i);
    });
  });

  describe("Admin permissions", () => {
    it("allows admin to delete another user's run", async () => {
      // Create a run as user1
      const createRes = await request(app)
        .post("/api/v1/users/me/runs")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({
          startTime: "2026-02-03T09:00:00.000Z",
          durationSec: 500,
          distanceMeters: 1500,
        });

      const newRunId = createRes.body.id;

      // Verify the run exists
      const getBeforeDelete = await request(app).get(
        `/api/v1/runs/${newRunId}`,
      );
      expect(getBeforeDelete.statusCode).toBe(200);

      // Delete it as admin
      const deleteRes = await request(app)
        .delete(`/api/v1/runs/${newRunId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(deleteRes.statusCode).toBe(204);
      expect(deleteRes.body).toEqual({});
    });

    it("admin deletion actually removes the run from database", async () => {
      // Create a run as user2
      const createRes = await request(app)
        .post("/api/v1/users/me/runs")
        .set("Authorization", `Bearer ${user2Token}`)
        .send({
          startTime: "2026-02-03T09:30:00.000Z",
          durationSec: 600,
          distanceMeters: 2000,
        });

      const newRunId = createRes.body.id;

      // Admin deletes the run
      await request(app)
        .delete(`/api/v1/runs/${newRunId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      // Verify it no longer exists
      const getAfterDelete = await request(app).get(`/api/v1/runs/${newRunId}`);
      expect404Error(getAfterDelete);
    });

    it("allows admin to delete their own runs", async () => {
      // Create a run as admin
      const createRes = await request(app)
        .post("/api/v1/users/me/runs")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          startTime: "2026-02-03T10:30:00.000Z",
          durationSec: 700,
          distanceMeters: 2500,
        });

      const adminRunId = createRes.body.id;

      // Admin deletes their own run
      const deleteRes = await request(app)
        .delete(`/api/v1/runs/${adminRunId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(deleteRes.statusCode).toBe(204);

      // Verify it's deleted
      const getAfterDelete = await request(app).get(
        `/api/v1/runs/${adminRunId}`,
      );
      expect404Error(getAfterDelete);
    });
  });

  describe("Validation", () => {
    const invalidIdCases = [
      { id: "not-a-valid-uuid", desc: "invalid UUID format" },
      { id: "000000zdg000000000000000000", desc: "malformed UUID" },
    ];

    invalidIdCases.forEach(({ id, desc }) => {
      it(`returns 400 for ${desc}`, async () => {
        const res = await request(app)
          .delete(`/api/v1/runs/${id}`)
          .set("Authorization", `Bearer ${user1Token}`);

        expect400WithMessage(res, /invalid|UUID/i);
      });
    });
  });

  describe("Not found", () => {
    it("returns 404 for non-existent run ID", async () => {
      const nonExistentId = TEST_RUN_IDS.nonExistent;
      const res = await request(app)
        .delete(`/api/v1/runs/${nonExistentId}`)
        .set("Authorization", `Bearer ${user1Token}`);

      expect404Error(res);
    });
  });

  describe("Successful deletion", () => {
    it("returns 204 when user successfully deletes their own run", async () => {
      // First, create a new run to delete
      const createRes = await request(app)
        .post("/api/v1/users/me/runs")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({
          startTime: "2026-02-03T10:00:00.000Z",
          durationSec: 600,
          distanceMeters: 2000,
        });

      const newRunId = createRes.body.id;

      // Now delete it
      const deleteRes = await request(app)
        .delete(`/api/v1/runs/${newRunId}`)
        .set("Authorization", `Bearer ${user1Token}`);

      expect(deleteRes.statusCode).toBe(204);
      expect(deleteRes.body).toEqual({});
    });

    it("actually removes the run from the database", async () => {
      // Create a run
      const createRes = await request(app)
        .post("/api/v1/users/me/runs")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({
          startTime: "2026-02-03T11:00:00.000Z",
          durationSec: 700,
          distanceMeters: 2500,
        });

      const newRunId = createRes.body.id;

      // Verify it exists
      const getBeforeDelete = await request(app).get(
        `/api/v1/runs/${newRunId}`,
      );
      expect(getBeforeDelete.statusCode).toBe(200);

      // Delete it
      await request(app)
        .delete(`/api/v1/runs/${newRunId}`)
        .set("Authorization", `Bearer ${user1Token}`);

      // Verify it no longer exists
      const getAfterDelete = await request(app).get(`/api/v1/runs/${newRunId}`);
      expect404Error(getAfterDelete);
    });

    it("removes the run from user's runs list", async () => {
      // Create a run
      const createRes = await request(app)
        .post("/api/v1/users/me/runs")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({
          startTime: "2026-02-03T12:00:00.000Z",
          durationSec: 800,
          distanceMeters: 3000,
        });

      const newRunId = createRes.body.id;

      // Get runs before deletion
      const getRunsBefore = await request(app)
        .get("/api/v1/users/me/runs")
        .set("Authorization", `Bearer ${user1Token}`);

      const countBefore = getRunsBefore.body.data.length;

      // Delete the run
      await request(app)
        .delete(`/api/v1/runs/${newRunId}`)
        .set("Authorization", `Bearer ${user1Token}`);

      // Get runs after deletion
      const getRunsAfter = await request(app)
        .get("/api/v1/users/me/runs")
        .set("Authorization", `Bearer ${user1Token}`);

      const countAfter = getRunsAfter.body.data.length;

      expect(countAfter).toBe(countBefore - 1);
      expect(
        getRunsAfter.body.data.find((run) => run.runId === newRunId),
      ).toBeUndefined();
    });

    it("allows user to delete multiple runs sequentially", async () => {
      // Create two runs
      const createRes1 = await request(app)
        .post("/api/v1/users/me/runs")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({
          startTime: "2026-02-03T13:00:00.000Z",
          durationSec: 900,
          distanceMeters: 3500,
        });

      const createRes2 = await request(app)
        .post("/api/v1/users/me/runs")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({
          startTime: "2026-02-03T14:00:00.000Z",
          durationSec: 1000,
          distanceMeters: 4000,
        });

      const runId1 = createRes1.body.id;
      const runId2 = createRes2.body.id;

      // Delete first run
      const deleteRes1 = await request(app)
        .delete(`/api/v1/runs/${runId1}`)
        .set("Authorization", `Bearer ${user1Token}`);

      expect(deleteRes1.statusCode).toBe(204);

      // Delete second run
      const deleteRes2 = await request(app)
        .delete(`/api/v1/runs/${runId2}`)
        .set("Authorization", `Bearer ${user1Token}`);

      expect(deleteRes2.statusCode).toBe(204);

      // Verify both are deleted
      const get1 = await request(app).get(`/api/v1/runs/${runId1}`);
      const get2 = await request(app).get(`/api/v1/runs/${runId2}`);

      expect404Error(get1);
      expect404Error(get2);
    });
  });

  describe("Idempotency", () => {
    it("returns 404 when trying to delete an already deleted run", async () => {
      // Create a run
      const createRes = await request(app)
        .post("/api/v1/users/me/runs")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({
          startTime: "2026-02-03T15:00:00.000Z",
          durationSec: 1100,
          distanceMeters: 4500,
        });

      const runId = createRes.body.id;

      // Delete it once
      const deleteRes1 = await request(app)
        .delete(`/api/v1/runs/${runId}`)
        .set("Authorization", `Bearer ${user1Token}`);

      expect(deleteRes1.statusCode).toBe(204);

      // Try to delete it again
      const deleteRes2 = await request(app)
        .delete(`/api/v1/runs/${runId}`)
        .set("Authorization", `Bearer ${user1Token}`);

      expect404Error(deleteRes2);
    });
  });
});
