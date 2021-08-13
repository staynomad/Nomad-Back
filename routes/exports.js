/* BASE PATH: /exports */

const express = require("express");
const router = express.Router();
const Exports = require("../controllers/exports.controller.js");
const { requireUserAuth } = require("../utils");

/*
  REQ PARAMS: filename
  DESCRIPTION: retrieves (downloads) exported listing calendar file
*/
router.get("/:filename", requireUserAuth, Exports.retrieveExport);

module.exports = router;
