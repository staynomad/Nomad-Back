/* BASE PATH: /subscribe */

const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const Subscribe = require("../controllers/subscribe.controller.js");

/*
  REQ BODY: email
  DESCRIPTION: adds email to subscription collection in database
*/
router.post("/", body("email").isEmail(), Subscribe.create);

/*
  DESCRIPTION: returns all emails from subscription collection
*/
router.get("/", Subscribe.getAll);

module.exports = router;
