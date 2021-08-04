/* BASE PATH: /subscribe */

const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const Subscribe = require("../controllers/subscribe.controller.js");

router.post("/", body("email").isEmail(), Subscribe.create);

router.get("/", Subscribe.getAll);

module.exports = router;
