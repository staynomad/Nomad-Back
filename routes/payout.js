/* BASE PATH: /payouts */

const express = require("express");
const router = express.Router();
const { requireUserAuth } = require("../utils");
const {
  stripeConnection,
  stripeDashboard,
} = require("../controllers/payout.controller");

/*
INPUT:
  user (requireUserAuth) - object automatically sent by passing in bearer token
  email (body) - string email corresponding to user being added to Stripe flow
DESCRIPTION:
  puts user into Stripe connection flow
*/
router.post("/setup", requireUserAuth, stripeConnection);

/*
INPUT:
  user (requireUserAuth) - object automatically sent by passing in bearer token
  email (body) - string email corresponding to user in Stripe flow
DESCRIPTION:
  gets link to the user's Stripe dashboard
*/
router.post("/express", requireUserAuth, stripeDashboard);

module.exports = router;
