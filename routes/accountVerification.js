/* BASE PATH: /accountVerification */

const express = require("express");
const router = express.Router();
const { requireUserAuth } = require("../utils");
const AccountVerification = require("../controllers/accountVerification.controller.js");

/*
  REQ USER: email, _id, name
  DESCRIPTION: sends verification email to signed in user (indicated by bearer token)
*/
router.post(
  "/sendVerificationEmail",
  requireUserAuth,
  AccountVerification.sendEmail
);

module.exports = router;
