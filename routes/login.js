const express = require("express");
const router = express.Router();

const User = require("../models/user.model");
const { getUserToken, validatePassword } = require("../utils");
const { check, validationResult } = require("express-validator");

/* User Login */
router.post(
  "/",
  [check("email").isEmail().withMessage("The email address is not valid")],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        let invalidEmail = new Error({ name: "Invalid email format" });
        invalidEmail.status = 401;
        throw invalidEmail;
      }
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      // explicit error handling for both user and password
      // 404 - status code if the user does not exist
      // 401 - status code if the passwords do not match
      // 200 - if everything is ok
      if (!user) {
        let missingUser = new Error(
          "The user with this email address does not exist"
        );
        missingUser.status = 404;
        throw missingUser;
      }

      if (!validatePassword(password, user.password)) {
        let incorrectPassword = new Error("Incorrect password.");
        incorrectPassword.status = 401;
        throw incorrectPassword;
      }
      const token = getUserToken(user);
      return res.status(200).json({
        token,
        userId: user.id,
        isHost: user.isHost,
        user: user,
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
