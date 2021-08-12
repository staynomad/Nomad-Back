/* BASE PATH: /googleLogin */

const express = require("express");
const router = express.Router();
const GoogleLogin = require("../controllers/googleLogin.controller.js");

/*
  REQ BODY: token, isHost
  DESCRIPTION: signs in or logs in user via Google account
*/
router.post("/", GoogleLogin.login);

module.exports = router;
