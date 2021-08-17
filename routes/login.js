/* BASE PATH: /login */

const express = require("express");
const router = express.Router();
const { check } = require("express-validator");

const Login = require("../controllers/login.controller");

/*
INPUT:
  email (body) - string email corresponding to user logging in
  password (body) - string password to be encrypted and verified
DESCRIPTION:
  signs in user and returns user data
*/
router.post(
  "/",
  [check("email").isEmail().withMessage("The email address is not valid")],
  Login.login
);

module.exports = router;
