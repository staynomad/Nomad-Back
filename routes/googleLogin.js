const express = require("express");
const router = express.Router();
const GoogleLogin = require("../controllers/googleLogin.controller.js");
router.post("/", GoogleLogin.googleLogin);

module.exports = router;
