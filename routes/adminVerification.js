/* BASE PATH: /adminVerify */

const express = require("express");
const router = express.Router();
const AdminVerification = require("../controllers/adminVerification.controller.js");

/*
INPUT:
  password (body) - string password for admin verification page indicated in .env
DESCRIPTION:
  verifies admin password (used in staging environment and admin dashboard)
*/
router.post("/", AdminVerification.verify);

module.exports = router;
