const express = require('express');
const router = express.Router();
const User = require("../models/user.model");

const { baseURL } = require('../config/index');

const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const stripe = require('stripe')(stripeSecretKey);

// Route to put user into Stripe connection flow
router.post('/setup', async(req, res) => {

  const { email } = req.body;

  try{
      const account = await stripe.accounts.create({
          type: 'express',
          country: 'US',
        });

      const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${baseURL}/myAccount`,
      return_url: `${baseURL}/myAccount`,
      type: 'account_onboarding',
      });

      const redirectURL = accountLink['url'];

      const user = await User.findOne({ email });
      user.stripeId = account.id;
      await user.save();

      res.status(200).json({
        link: redirectURL,
        id: account.id
      })
    } catch (e){
      console.log(e)
      res.status(500).json({
        'error': 'Stripe accountLink failed'
      })
    } 
}

);

// Route to get link to the user's Stripe dashboard
router.post('/express', async(req, res) => {
  try{
    const { email } = req.body
    const user = await User.findOne({ email });
    const link = await stripe.accounts.createLoginLink(user.stripeId);

    return res.status(200).json({
      link: link.url,
    })
  } catch (e){
    console.log(e)
    return res.status(500).json({
      'error': 'Stripe express failed'
    })
  }
}

);

module.exports = router;



