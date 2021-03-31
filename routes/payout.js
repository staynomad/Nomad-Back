const express = require('express');
const router = express.Router();

const { baseURL } = require('../config/index');

const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const stripe = require('stripe')(stripeSecretKey);

router.post('/payout', async(req, res) => {




    const account = await stripe.accounts.create({
        type: 'express',
        country: 'US',
        email: 'jenny.rosen@example.com',
      });



    const accountLink = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: `${baseURL}/myAccount`,
    return_url: `${baseURL}`,
    type: 'account_onboarding',
    });
});




