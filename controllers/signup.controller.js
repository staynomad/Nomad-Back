const User = require("../models/user.model");
const { getUserToken, passGenService } = require("../utils");
const { incHousekeepingUsers } = require("../helpers/account.helper");
const { sendVerificationEmail } = require("../helpers/account.helper");

const { validationResult } = require("express-validator");

/* POST users listing. */
const signup = async (req, res) => {
  try {
    // data validation
    // why 422 status code? -> https://www.bennadel.com/blog/2434-http-status-codes-for-invalid-data-400-vs-422.htm
    let errors = validationResult(req).array();
    const { name, email, password, isHost } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      const emailError = {
        value: email,
        msg: `User already exists with email ${email}`,
        param: "email",
        location: "body",
      };
      errors.push(emailError);
    }
    if (errors.length !== 0) return res.status(422).json(errors);
    // encrypt the password
    const encrypted_password = await passGenService(password);
    // create a new user
    const data = {
      name,
      email,
      password: encrypted_password,
      isHost,
      isPublic: isHost,
    };
    // Set isVerified to false only if user is a host
    if (isHost) {
      data.isVerified = false;
    }
    const newUser = await new User(data).save();
    incHousekeepingUsers();
    if (isHost) {
      sendVerificationEmail(data.email, newUser._id);
    }

    // now send the token
    const token = getUserToken({ id: newUser._id });

    // we could send the 200 status code
    // but 201 indicates the resource is created
    res.status(201).json({
      token,
      userId: newUser._id,
    });
  } catch (error) {
    // explicit error catching
    console.error(error);
    res.status(500).json({
      errors: ["Error signing up user. Please try again!"],
    });
  }
};

module.exports = { signup };
