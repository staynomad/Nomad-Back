/* BASE PATH: /contact */

const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const Contact = require("../controllers/contact.controller.js");

/*
INPUT:
  name - string name of user sending contact email
  email - string email address of user sending contact email
  subject - string subject of the contact email
  text (body) - string text message of the contact email
DESCRIPTION:
  sends contact email to company email
*/
router.post("/", body("email").isEmail(), Contact.sendEmail);

module.exports = router;
