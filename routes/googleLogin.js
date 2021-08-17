/* BASE PATH: /googleLogin */

const express = require("express");
const router = express.Router();
const GoogleLogin = require("../controllers/googleLogin.controller.js");

/*
INPUT:
  token (body) - string Google Auth token sent from frontend, validated with token in .env
  isHost (body) - boolean value indicating if user signing in is host
DESCRIPTION:
  signs in or logs in user via Google account
*/
router.post("/", GoogleLogin.login);

module.exports = router;
