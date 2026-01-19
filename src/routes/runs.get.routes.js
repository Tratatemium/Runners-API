const express = require("express");
const router = express.Router();

const { validateUUID } = require("../validation/validation.js");
const { getRunByID } = require("../database.js");

router.get("/:id", async (req, res) => {
  validateUUID(req.params.id, "runID");
  const data = await getRunByID(req.params.id);
  res.send(data);
});

module.exports = router;
