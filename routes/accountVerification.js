/* BASE PATH: /accountVerification */

const express = require("express");
const router = express.Router();
const { requireUserAuth } = require("../utils");
const AccountVerification = require("../controllers/accountVerification.controller.js");

router.post(
  "/sendVerificationEmail",
  requireUserAuth,
  AccountVerification.sendEmail
);

module.exports = router;
