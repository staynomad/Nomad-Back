const express = require("express")
const User = require("../models/user.model")
const { getUserToken, passGenService } = require("../utils")
const { check, body, validationResult } = require('express-validator')
const nodemailer = require('nodemailer')
const axios = require('axios')
const router = express.Router()

/* POST users listing. */
router.post("/", [
  check('email', "Invalid email address").isEmail(),
  check('name', "Name cannot be empty").isLength({ min: 1 }),
  body('check')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match')
      }
      else {
        return true
      }
    }),
  check('password')
    .isLength({ min: 8 }).withMessage('Password must contain at least 8 characters')
    .matches(/\d/).withMessage('Password must contain a number')
    .matches(/[A-Z]/).withMessage('Password must contain an uppercase character')
    .matches(/[a-z]/).withMessage('Password must contain a lowercase character')
    .matches(/^[a-zA-Z0-9!@#$%^&*)(+=._-]+$/).withMessage('Password must contain one special character')
],
  async (req, res) => {
    try {
      // data validation
      // why 422 status code? -> https://www.bennadel.com/blog/2434-http-status-codes-for-invalid-data-400-vs-422.htm
      let errors = validationResult(req).array()
      const { name, email, password, isHost } = req.body
      const user = await User.findOne({ email })
      if (user) {
        const emailError = {
          value: email,
          msg: `User already exists with email ${email}`,
          param: 'email',
          location: 'body'
        }
        errors.push(emailError)
      }
      if (errors.length !== 0) return res.status(422).json(errors)

      // encrypt the password
      const encrypted_password = await passGenService(password)
      // create a new user
      const data = {
        name,
        email,
        password: encrypted_password,
        isHost
      }
      // Set isVerified to false only if user is a host
      if (isHost) {
        data.isVerified = false
      }
      const newUser = await new User(data).save()
      // now send the token
      const token = getUserToken({ id: newUser._id })
      // Send account verification email if user is host
      const emailData = {
        email: email,
        userId: newUser._id
      }
      if (isHost) {
        await axios
          .post(`https://nvestup.com/accountVerification/sendVerificationEmail`, emailData, {
            headers: {
              "Authorization": `Bearer ${token}`
            }
          })
          .catch(e => console.log("Unable to send verification email to host."))
      }
      // Add signed up user to Mailchimp subscription list
      const subscriptionData = {
        email: email
      }
      await axios
        .post('https://nvestup.com/subscribe', subscriptionData)
        .catch(e => console.log("Unable to add email to subscription list."))
      // we could send the 200 status code
      // but 201 indicates the resource is created
      res.status(201).json({
        token,
        userId: newUser._id,
      })
    }
    catch (error) {
      // explicit error catching
      console.error(error)
      res.status(500).json({
        "errors":
          ["Error signing up user. Please try again!"]
      })
    }
  }
)

module.exports = router
