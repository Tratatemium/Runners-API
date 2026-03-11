const { createApp } = require("../src/app.js"); // function, not pre-created app
console.log("Before DB connect");
await connectDB();
console.log("After DB connect");

const app = createApp();
const handler = require("serverless-http")(app);
await handler(req, res);
