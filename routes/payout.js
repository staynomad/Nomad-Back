const express = require("express");
const router = express.Router();
const {
  stripeConnection,
  stripeDashboard,
} = require("../controllers/payout.controller");

// Route to put user into Stripe connection flow
router.post("/setup", stripeConnection);

// Route to get link to the user's Stripe dashboard
router.post("/express", stripeDashboard);

module.exports = router;
