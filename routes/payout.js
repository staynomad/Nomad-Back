const express = require('express');
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
      })
    } catch (e){
      console.log(e)
      return res.status(500).json({
        'error': 'Stripe accountLink failed'
      })
    } 
}

);

module.exports = router;



