/* BASE PATH: /ping */

const express = require("express");
const router = express.Router();
const Ping = require("../controllers/ping.controller.js");

/*
INPUT:
  N/A
DESCRIPTION:
  returns server and database statuses
*/
router.get("/", Ping.ping);

module.exports = router;
