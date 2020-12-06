const express = require('express');
const router = express.Router()
const { body, validationResult } = require('express-validator');

const User = require('../models/user');

router.post('/',
  body('email').isEmail(),
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        const errorMessages = errors.array().map((x) => x.msg);
        return res.status(422).json({ errors: `${req.body.email} is not a valid email address. Please try again.`});
      }
      const { email } = req.body;
      const user = await User.findOne({ email });
      if(user) {
        return res.status(422).json({ errors: `${email} has already been registered.`})
      }
      // create a new user
      const newUser = await new User({
        email,
      }).save()
      .then(
        res.status(200).json({message: [`Thanks for signing up!`]})
      );
    }
    catch(error) {
      console.error(error);
      res.status(500).json({
        "errors":
        "Error signing up. Please try again!"
      });
    }
})

router.get('/',
  async (req, res) => {
    try {
      const users = await User.find();
      if (!users) {
        res.status(400).json({"errors": "No users found."})
      }
      else {
        var data = []
        for (let i = 0; i < users.length; i++) {
          data.push(users[i].email)
        }
        res.status(200).json(data)
      }
    }
    catch(error) {
      console.error(error);
      res.status(500).json({
        "errors":
        "Problem connecting with database. Please try again!"
      });
    }
})
module.exports = router
