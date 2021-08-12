const express = require("express");
const { createStripeSession } = require("../controllers/payment.controller");
const router = express.Router();

const { requireUserAuth } = require("../utils");

// Create stripe checkout session
router.post("/create-session", requireUserAuth, createStripeSession);

module.exports = router;
