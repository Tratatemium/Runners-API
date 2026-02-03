const request = require("supertest");
const app = require("../../../src/app.js");
const { TEST_RUN_IDS } = require("../../helpers/test-data");
const { expectValidRunStructure, expect404Error, expect400WithMessage } = require("../../helpers/assertions");
const { expectJsonResponse } = require("../../helpers/request.helpers");

describe("GET /runs/:id", () => {
  it("returns 200 and run JSON for an existing ID", async () => {
    const runId = TEST_RUN_IDS.user1Run1;
    const res = await request(app).get(`/runs/${runId}`);

    expectJsonResponse(res, 200);
    expect(res.body).toHaveProperty("runId", runId);
    expectValidRunStructure(res.body);
  });

  it("returns 404 for a non-existing ID", async () => {
    const runId = TEST_RUN_IDS.nonExistent;
    const res = await request(app).get(`/runs/${runId}`);

    expect404Error(res);
  });

  it("returns 400 for non-UUID", async () => {
    const runId = "not-a-UUID";
    const res = await request(app).get(`/runs/${runId}`);

    expect400WithMessage(res, /invalid|UUID/i);
  });
});
