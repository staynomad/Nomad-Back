/* BASE PATH: /exports */

const express = require("express");
const router = express.Router();
const Exports = require("../controllers/exports.controller.js");

/*
  REQ PARAMS: filename
  DESCRIPTION: retrieves (downloads) exported listing calendar file
*/
router.get("/:filename", Exports.exportListingCalendar);

module.exports = router;
