const request = require("supertest");
const app = require("../../../src/app.js");
const { expectJsonResponse } = require("../../helpers/request.helpers");

describe("Server Health Endpoints", () => {
  describe("GET /", () => {
    it("checks server availability", async () => {
      const res = await request(app).get("/");

      expectJsonResponse(res, 200);
      expect(res.body).toHaveProperty("message");
    });
  });

  describe("GET /server-runtime", () => {
    it("checks server runtime", async () => {
      const res = await request(app).get("/server-runtime");

      expectJsonResponse(res, 200);
      expect(res.body).toHaveProperty("message");
      expect(res.body.message).toMatch(/^Server is running for \d+(\.\d)? s\.$/);
    });
  });
});
