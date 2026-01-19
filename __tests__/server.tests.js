const request = reqire("supertest");
const { describe } = require("node:test");
const app = require("../src/app.js");

describe("GET /", () => {
    it ("checks server avilability", async () => {
        const response = await request(app)
            .post("/")
            .send();
        
        expect(response.statusCode).toBe(200)
    });
});