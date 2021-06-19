const express = require('express');
const router = express.Router();

const Listing = require('../models/listing.model');
const Reservation = require('../models/reservation.model');
const { baseURL } = require('../config/index');
const User = require('../models/user.model');

const stripeSecretKey = process.env.STRIPE_SECRET_KEY

const stripe = require('stripe')(stripeSecretKey);

// Create stripe checkout session
router.post('/create-session', async (req, res) => {
  try {
    const { dates, days, listingId, reservationId } = req.body
    const listingDetails = await Listing.findOne({
      '_id': listingId
    })
    if (!listingDetails) {
      return res.status(404).json({
        'error': 'Listing not Found',
      });
    };

    const reservationDetails = await Reservation.findOne({
      '_id': reservationId
    })
    if (!reservationDetails) {
      return res.status(404).json({
        'error': 'Reservation not Found',
      });
    };

    const user = await User.findOne({
      '_id': listingDetails.user,
    })
    if(!user) {
      return res.status(404).json({
        'error': 'Host not Found',
      });
    };

    


    // address here isn't needed, will keep temporarily in case we revert back
    const address = `${listingDetails.location.street}, ${listingDetails.location.city}, ${listingDetails.location.state}, ${listingDetails.location.zipcode}`;
    const parseDateOne = new Date(Date.parse(dates[0]));
    const parseDateTwo = new Date(Date.parse(dates[1]));

    const dateOne = {
      day: parseDateOne.getUTCDate(),
      month: parseDateOne.getUTCMonth() + 1,
      year: parseDateOne.getUTCFullYear(),
    };

    const dateTwo = {
      day: parseDateTwo.getUTCDate(),
      month: parseDateTwo.getUTCMonth() + 1,
      year: parseDateTwo.getUTCFullYear(),
    };

    const stripeId = user.stripeId;
    const guestFee = reservationDetails.guestFee;
    const listingPrice = listingDetails.price;
    const centsToDollars = 100; 

    // Total price of the listing including guest fee. Host fee + our profit is taken from this. 
    const listingTotal = (listingPrice * days * centsToDollars) + (guestFee * centsToDollars);

    // Price we make - Host Fee (1%) + Guest Fee (10%)
    const applicationFee = (listingPrice * days * centsToDollars) * 0.01 + (guestFee * centsToDollars)

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          description: `Reservation Dates: ${dateOne.month}/${dateOne.day}/${dateOne.year} - ${dateTwo.month}/${dateTwo.day}/${dateTwo.year} |
                        Guest Fees: 10%, $${guestFee}`,
          price_data: {
            currency: 'usd',
            application_fee_amount: applicationFee,
            transfer_data: {
              destination: stripeId,
            },
            product_data: {
              name: `${listingDetails.title}`,
              images: [listingDetails.pictures[0]],
            },
            unit_amount: listingTotal,
          },
          quantity: 1,
        },
      ],

        mode: 'payment',
      allow_promotion_codes: true,
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
