const request = require("supertest");
const app = require("../src/app.js");

describe("GET /", () => {
  it("checks server availability", async () => {
    const response = await request(app).get("/");

    expect(response.statusCode).toBe(200);
  });
});

describe("GET /server-runtime", () => {
  it("checks server runtime", async () => {
    const response = await request(app).get("/server-runtime");

    expect(response.statusCode).toBe(200);
  });
});





// it("creates user", async () => {
//   // test
// }, 10000);
