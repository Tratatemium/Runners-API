const { sendSuccess } = require("../utils/response.utils.js");
const { checkDBconnection } = require("../utils/db.utils.js");
const { getUptime } = require("../utils/server.utils.js");

const healthController = (req, res) => {
  sendSuccess(res, 200, {
    status: "running",
    uptime: getUptime(),
    version: "1.0.0",
    DBconnection: checkDBconnection(),
  });
};

module.exports = { healthController };
