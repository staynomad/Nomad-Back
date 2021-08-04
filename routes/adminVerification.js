const express = require("express");
const router = express.Router();
const AdminVerification = require("../controllers/adminVerification.controller.js");

router.post("/", AdminVerification.verify);

module.exports = router;
