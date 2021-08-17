const express = require("express");
const router = express.Router();
const { addRating } = require("../controllers/reviews.controller");
const { requireUserAuth } = require("../utils");

// Add rating to listing object
router.post("/:listingId", requireUserAuth, addRating);

module.exports = router;
