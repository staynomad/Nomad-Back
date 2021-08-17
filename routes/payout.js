const express = require("express");
const router = express.Router();
const { requireUserAuth } = require("../utils");
const {
  stripeConnection,
  stripeDashboard,
} = require("../controllers/payout.controller");

// Route to put user into Stripe connection flow
router.post("/setup", requireUserAuth, stripeConnection);

// Route to get link to the user's Stripe dashboard
router.post("/express", requireUserAuth, stripeDashboard);

module.exports = router;
