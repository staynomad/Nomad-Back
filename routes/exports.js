/* BASE PATH: /exports */

const express = require("express");
const router = express.Router();
const Exports = require("../controllers/exports.controller.js");
const { requireUserAuth } = require("../utils");

/*
INPUT:
  filename (params) - string name of ical file being downloaded from exports folder
DESCRIPTION:
  downloads exported listing calendar file
*/
router.get("/:filename", Exports.retrieveExport);

module.exports = router;
