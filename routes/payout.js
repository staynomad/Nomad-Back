const express = require('express');
const router = express.Router();

const { baseURL } = require('../config/index');

const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const stripe = require('stripe')(stripeSecretKey);

router.post('/payout', async(req, res) => {

  console.log("hi")

  // TODO: Broken b/c connect api not connectd on stripe, go to https://stripe.com/docs/connect. 
    const account = await stripe.accounts.create({
        type: 'express',
        country: 'US',
        // email: 'jenny.rosen@example.com',
      });



    const accountLink = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: `${baseURL}/myAccount`,
    return_url: `${baseURL}`,
    type: 'account_onboarding',
    });

    const redirectURL = accountLink['url'];

    return res.status(200).json({
      link: redirectURL,
    })
});

module.exports = router;



