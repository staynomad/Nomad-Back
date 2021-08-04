const express = require("express");
const router = express.Router();
const GoogleLogin = require("../controllers/googleLogin.controller.js");

router.post("/", GoogleLogin.login);

module.exports = router;
