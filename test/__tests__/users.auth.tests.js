//   {
//     "username": "test_runner_01",
//     "password": "TestPassword123!",
//     "email": "runner01@test.com"
//   },
//   {
//     "username": "test_runner_02",
//     "password": "SecurePass456!",
//     "email": "runner02@test.com"
//   }

const request = require("supertest");
const app = require("../../src/app.js");


// router.post("/login", validation.validateLoginRequest, usersController.login);