/* BASE PATH: /contact */

const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const Contact = require("../controllers/contact.controller.js");

/*
  REQ BODY: name, email, subject, text
  DESCRIPTION: sends contact email to company email
*/
router.post("/", body("email").isEmail(), Contact.sendEmail);

module.exports = router;
