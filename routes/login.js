const express = require("express");
const router = express.Router();
const { check } = require("express-validator");

const Login = require("../controllers/login.controller");

/* User Login */
router.post(
  "/",
  [check("email").isEmail().withMessage("The email address is not valid")],
  Login.login
);

module.exports = router;
