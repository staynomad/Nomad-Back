/* BASE PATH: /reviews */

const express = require("express");
const router = express.Router();
const { addRating } = require("../controllers/reviews.controller");
const { requireUserAuth } = require("../utils");

/*
INPUT:
  user (requireUserAuth) - object automatically sent by passing in bearer token
  rating (body) - int representing number of stars given in review, between 0 and 5
  review (body) - string text of review message
DESCRIPTION:
  adds rating field to listing object
*/
router.post("/:listingId", requireUserAuth, addRating);

module.exports = router;
