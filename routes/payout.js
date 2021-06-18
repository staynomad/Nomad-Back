const express = require('express');
const { rest } = require('lodash');
const router = express.Router();

const { baseURL } = require('../config/index');

const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const stripe = require('stripe')(stripeSecretKey);

router.post('/setup', async(req, res) => {

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

      return res.status(200).json({
        link: redirectURL,
        id: account.id
      })
    } catch (e){
      console.log(e)
      return res.status(500).json({
        'error': 'Stripe accountLink failed'
      })
    } 
}

);

router.post('/express', async(req, res) => {
  try{
    console.log(req.params)
    const link = await stripe.accounts.createLoginLink(req.body.userId);

    return res.status(200).json({
      link: link, //.url,
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



