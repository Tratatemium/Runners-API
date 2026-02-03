const request = require("supertest");
const app = require("../../../src/app.js");
const { TEST_USERS, VALID_PROFILE_DATA } = require("../../helpers/test-data");
const { getAuthToken } = require("../../helpers/auth.helpers");
const {
  expect400WithMessage,
  expectJsonResponse,
  expect401Error,
  expect415Error,
} = require("../../helpers/assertions");
const {
  getAuthValidationTests,
  getContentTypeTests,
} = require("../../helpers/request.helpers");

describe("PATCH /users/me/profile", () => {
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

  describe("Content-Type validation", () => {
    getContentTypeTests().forEach(({ name, contentType, body }) => {
      it(name, async () => {
        const res = await request(app)
          .patch("/users/me/profile")
          .set("Content-Type", contentType)
          .set("Authorization", `Bearer ${user1Token}`)
          .send(body);

        expect415Error(res);
      });
    });
  });

  describe("Authentication validation", () => {
    getAuthValidationTests().forEach(({ name, setupAuth }) => {
      it(name, async () => {
        const req = request(app)
          .patch("/users/me/profile")
          .send({ profile: { firstName: "John" } });
        const res = await setupAuth(req);

        expect401Error(res);
      });
    });
  });

  describe("Profile object validation", () => {
    const invalidProfileCases = [
      { profile: undefined, desc: "missing" },
      { profile: null, desc: "null" },
      { profile: "not an object", desc: "not an object" },
      { profile: [], desc: "an array" },
    ];

    invalidProfileCases.forEach(({ profile, desc }) => {
      it(`returns 400 when profile is ${desc}`, async () => {
        const res = await request(app)
          .patch("/users/me/profile")
          .set("Authorization", `Bearer ${user1Token}`)
          .send({ profile });

        expect400WithMessage(res, "profile (object) must be provided.");
      });
    });

    it("returns 400 for unknown field in profile", async () => {
      const res = await request(app)
        .patch("/users/me/profile")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({ profile: { unknownField: "value" } });

      expect400WithMessage(res, "Unknown field: unknownField");
    });

    it("returns 400 for multiple unknown fields", async () => {
      const res = await request(app)
        .patch("/users/me/profile")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({ profile: { age: 25, city: "Stockholm" } });

      expectJsonResponse(res, 400);
      expect(res.body).toHaveProperty("error");
    });
  });

  describe("Field validation", () => {
    const nameValidationCases = [
      { field: "firstName", value: "", error: /firstName/ },
      { field: "firstName", value: "John123", error: /firstName/ },
      { field: "firstName", value: "John@Doe", error: /firstName/ },
      { field: "firstName", value: "J", error: /firstName/ },
      { field: "firstName", value: "A".repeat(51), error: /firstName/ },
      { field: "lastName", value: "", error: /lastName/ },
      { field: "lastName", value: "Doe123", error: /lastName/ },
      { field: "lastName", value: "Doe#Smith", error: /lastName/ },
    ];

    nameValidationCases.forEach(({ field, value, error }) => {
      it(`returns 400 for invalid ${field}: ${value.slice(0, 20)}`, async () => {
        const res = await request(app)
          .patch("/users/me/profile")
          .set("Authorization", `Bearer ${user1Token}`)
          .send({ profile: { [field]: value } });

        expect400WithMessage(res, error);
      });
    });

    const dateValidationCases = [
      { value: "1990-13-45", desc: "invalid date format" },
      { value: "12/31/1990", desc: "non-ISO date format" },
      { value: "", desc: "empty string" },
    ];

    dateValidationCases.forEach(({ value, desc }) => {
      it(`returns 400 for dateOfBirth: ${desc}`, async () => {
        const res = await request(app)
          .patch("/users/me/profile")
          .set("Authorization", `Bearer ${user1Token}`)
          .send({ profile: { dateOfBirth: value } });

        expectJsonResponse(res, 400);
      });
    });

    const numericValidationCases = [
      { field: "heightCm", value: -180, desc: "negative" },
      { field: "heightCm", value: 0, desc: "zero" },
      { field: "heightCm", value: "180", desc: "string" },
      { field: "weightKg", value: -70, desc: "negative" },
      { field: "weightKg", value: 0, desc: "zero" },
      { field: "weightKg", value: "70", desc: "string" },
    ];

    numericValidationCases.forEach(({ field, value, desc }) => {
      it(`returns 400 for ${field}: ${desc}`, async () => {
        const res = await request(app)
          .patch("/users/me/profile")
          .set("Authorization", `Bearer ${user1Token}`)
          .send({ profile: { [field]: value } });

        expectJsonResponse(res, 400);
      });
    });
  });

  describe("Successful profile updates", () => {
    const successCases = [
      { profile: { firstName: "John" }, desc: "firstName only" },
      { profile: { lastName: "Doe" }, desc: "lastName only" },
      { profile: { dateOfBirth: "1990-05-15" }, desc: "dateOfBirth only" },
      { profile: { heightCm: 180 }, desc: "heightCm only" },
      { profile: { weightKg: 75 }, desc: "weightKg only" },
      { profile: VALID_PROFILE_DATA, desc: "all fields" },
      { profile: { firstName: "Anne-Marie" }, desc: "name with hyphens" },
      { profile: { lastName: "O'Brien" }, desc: "name with apostrophes" },
      { profile: { firstName: "Mary Jane" }, desc: "name with spaces" },
      { profile: { heightCm: 175.5 }, desc: "decimal heightCm" },
      { profile: { weightKg: 72.3 }, desc: "decimal weightKg" },
    ];

    successCases.forEach(({ profile, desc }) => {
      it(`returns 200 when updating ${desc}`, async () => {
        const res = await request(app)
          .patch("/users/me/profile")
          .set("Authorization", `Bearer ${user1Token}`)
          .send({ profile });

        expectJsonResponse(res, 200);
      });
    });

    it("allows different users to update their own profiles", async () => {
      const res1 = await request(app)
        .patch("/users/me/profile")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({ profile: { firstName: "Anna" } });

      const res2 = await request(app)
        .patch("/users/me/profile")
        .set("Authorization", `Bearer ${user2Token}`)
        .send({ profile: { firstName: "Boris" } });

      expect(res1.statusCode).toBe(200);
      expect(res2.statusCode).toBe(200);
    });
  });
});
