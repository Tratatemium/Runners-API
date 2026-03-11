const { checkDBConnection } = require("../utils/db.utils.js");
const { getUptime } = require("../utils/server.utils.js");

const healthController = (req, res) => {
  res.status(200).json({
    status: "running",
    uptime: getUptime(),
    version: "1.0.0",
    DBConnection: checkDBConnection(),
  });
};

module.exports = { healthController };
