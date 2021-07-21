const express = require('express');
const router = express.Router()
const { body, validationResult } = require('express-validator');

const Subscriber = require('../models/subscriber.model');

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
      const subscriber = await Subscriber.findOne({ email });
      if(subscriber) {
        return res.status(422).json({ errors: `${email} has already been registered.`})
      }
      // create a new subscriber
      const newsubscriber = await new Subscriber({
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
      const subscribers = await Subscriber.find();
      if (!subscribers) {
        res.status(400).json({"errors": "No subscribers found."})
      }
      else {
        var data = []
        for (let i = 0; i < subscribers.length; i++) {
          data.push(subscribers[i].email)
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
