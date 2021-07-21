const express = require("express");
const router = express.Router();
const { exportURL } = require("../config/index");

router.get("/:filename", async (req, res) => {
  const file = `./exports/${req.params.filename}`;
  res.download(file);
});

module.exports = router;
