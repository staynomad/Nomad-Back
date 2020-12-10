const express = require('express');
const router = express.Router();

const Listing = require('../models/listing.model');
const { baseURL } = require('../config/index');

const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const stripePublicKey = process.env.STRIPE_PUBLIC_KEY

const stripe = require('stripe')(stripeSecretKey);

// Create stripe checkout session
router.post('/create-session', async (req, res) => {
  try {
    const { days, listingId, reservationId } = req.body

    const listingDetails = await Listing.findOne({
      '_id': listingId
    })
    if (!listingDetails) {
      return res.status(404).json({
        'error': 'Listing not Found',
      });
    };

    const address = `${listingDetails.location.street}, ${listingDetails.location.city}, ${listingDetails.location.state}, ${listingDetails.location.zipcode}`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name:
                `${listingDetails.description} - ${address}`,
              images: [listingDetails.pictures[0]],
            },
            unit_amount: listingDetails.price * days * 100,
          },
          quantity: 1,
        },
      ],

      mode: 'payment',
      success_url: `${baseURL}/completeReservation/${listingId}/${reservationId}`,
      cancel_url: `${baseURL}/listing/${listingId}`,
    });
    res.status(201).json({
      id: session.id,
      'output': listingDetails.price * days * 100
    });
  }
  catch (error) {
    console.error(error);
    res.status(500).json({
      'error': 'invalid'
    });

  }
});

module.exports = router;
