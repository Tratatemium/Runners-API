const request = require("supertest");
const app = require("../src/app.js");

describe("GET /", () => {
  it("checks server availability", async () => {
    const res = await request(app).get("/");

    expect(res.statusCode).toBe(200);
    expect(res.headers["content-type"]).toMatch(/json/);
    expect(res.body).toHaveProperty("message");
  });
});

describe("GET /server-runtime", () => {
  it("checks server runtime", async () => {
    const res = await request(app).get("/server-runtime");

    expect(res.statusCode).toBe(200);
    expect(res.headers["content-type"]).toMatch(/json/);
    expect(res.body).toHaveProperty("message");
    expect(res.body.message).toMatch(/^Server is running for \d+(\.\d)? s\.$/);
  });
});





// it("creates user", async () => {
//   // test
// }, 10000);
