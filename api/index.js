const serverless = require("serverless-http");
const app = require("../src/app.js");
const { connectDB } = require("../src/utils/db.utils.js");

let connected = false;

module.exports = async (req, res) => {
    if(!connected) {
        await connectDB();
        connected = true;
    }

    return serverless(app)(req, res);
};