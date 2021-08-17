const express = require("express");
const router = express.Router();
const { check, body } = require("express-validator");
const Signup = require("../controllers/signup.controller");

/* POST users listing. */
router.post(
  "/",
  [
    check("email", "Invalid email address").isEmail(),
    check("name", "Name cannot be empty").isLength({ min: 1 }),
    body("check").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      } else {
        return true;
      }
    }),
    check("password")
      .isLength({ min: 8 })
      .withMessage("Password must contain at least 8 characters")
      .matches(/\d/)
      .withMessage("Password must contain a number")
      .matches(/[A-Z]/)
      .withMessage("Password must contain an uppercase character")
      .matches(/[a-z]/)
      .withMessage("Password must contain a lowercase character")
      .matches(/[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/)
      .withMessage("Password must contain one special character"),
  ],
  Signup.signup
);

module.exports = router;
