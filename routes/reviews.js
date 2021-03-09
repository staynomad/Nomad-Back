const express = require("express");
const router = express.Router();
const mongoose = require('mongoose')

const Listing = require("../models/listing.model")
const { requireUserAuth } = require("../utils");

// Add rating to listing object
router.post(
  '/:listingId',
  requireUserAuth,
  async (req, res) => {
    try {
      // Rating is an integer ranging from 1-5
      // Review is the message posted by the user
      const { rating, review } = req.body
      const ratingData = {
        userId: mongoose.Types.ObjectId(String(req.user._id)),
        stars: parseInt(rating),
        review: review,
        timestamp: new Date()
      }
      // Check here to see if user has already submitted review for specific listing
      const listingCheck = await Listing.findById(req.params.listingId)
      if (listingCheck.rating !== null) {
        for (let i = 0; i < listingCheck.rating; i++) {
          if (listingCheck.rating[i].userId == req.user._id) {
            return res.status(400).json({
              "errors": "You have already reviewed this listing."
            })
          }
        }
      }
      const listing = await Listing.findOneAndUpdate({ _id: req.params.listingId }, { $push: { rating: ratingData } }, { new: true })
      if (!listing) {
        return res.status(400).json({
          "errors": "Listing does not exist. Please try again."
        })
      }
      res.status(201).json({
        "message": "Review submitted successfully."
      });
    }
    catch (error) {
      console.log(error);
      res.status(500).json({
        "errors": "Error submitting review. Please try again!"
      });
    }
  }
)

module.exports = router;
