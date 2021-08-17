/* BASE PATH: /payment */

const express = require("express");
const router = express.Router();
const { createStripeSession } = require("../controllers/payment.controller");
const { requireUserAuth } = require("../utils");

/*
INPUT:
  user (requireUserAuth) - object automatically sent by passing in bearer token
  dates (body) - array of 2 UTC timestamps, first is start date second is end date
  days (body) - int number of days the reservation lasts
  listingId (body) - ID of listing being booked
  reservationId (body) - ID of reservation object corresponding to checkout
DESCRIPTION:
  creates stripe payment checkout session
*/
router.post("/create-session", requireUserAuth, createStripeSession);

module.exports = router;
