const express = require("express");
const router = express.Router();

const { getRunByID } = require("../database.js");

router.get("/:id", async (req, res) => {
  const data = await getRunByID(req.params.id);
  res.send(data);
});

module.exports = router;
