const express = require("express");
const router = express.Router();

const { isUUID } = require("../validation/validation.js");
const { getRunByID } = require("../database.js");

router.get("/:id", async (req, res) => {
  if (!isUUID(req.params.id)) {
    const err = new Error(
      "runID must be a valid UUID."
    );
    err.status = 400;
    throw err;
  }
  const data = await getRunByID(req.params.id);
  res.send(data);
});

module.exports = router;
