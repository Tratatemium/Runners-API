const request = require("supertest");
const app = require("../../../src/app.js");
const { expectJsonResponse } = require("../../helpers/assertions.js");

describe("Server Health Endpoints", () => {
  describe("GET /health", () => {
    it("returns health status with uptime and version", async () => {
      const res = await request(app).get("/health");

      expectJsonResponse(res, 200);
      expect(res.body).toHaveProperty("status", "running");
      expect(res.body).toHaveProperty("uptime");
      expect(res.body).toHaveProperty("version");
      expect(res.body.uptime).toMatch(/^\d{2}:\d{2}:\d{2}$/);
    });
  });
});
