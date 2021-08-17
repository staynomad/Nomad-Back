const express = require("express");
const router = express.Router();
const { requireUserAuth } = require("../utils");
const { multerUploads } = require("../helpers/photos.helper");
const {
  createListing,
  activateListing,
  deactivateListing,
  editListing,
  editListingImages,
  getAllListings,
  getActiveListings,
  getFilteredListings,
  getListingsByRadius,
  getListingsByUser,
  getListingsByID,
  getListingsBySearch,
  deleteListingByID,
  syncListingsByID,
  getTransferRequests,
  sendTransferRequest,
  acceptTransferRequest,
  rejectTransferRequest,
  incrementListingVisit,
  getPopularListings,
  getAllPopularListings,
  exportListings,
} = require("../controllers/listing.controller");

/*
  REQ BODY: name, email, subject, text
  DESCRIPTION: creates a listing
*/
router.post("/createListing", multerUploads, requireUserAuth, createListing);

// Change listing's active field to true
router.put("/activateListing/:listingId", requireUserAuth, activateListing);

// Change listing's active field to false
router.put("/deactivateListing/:listingId", requireUserAuth, deactivateListing);

/* Update a listing */
router.put(
  "/editListing/:listingId",
  multerUploads,
  requireUserAuth,
  editListing
);

/* Delete image(s) from a listing */
router.put("/editListingImages/:listingId", requireUserAuth, editListingImages);

/* Get all listings */
router.get("/", getAllListings);

/* Get all active listings */
router.get("/active", getActiveListings);

/* Get all listings by filter */
router.post("/filteredListings", getFilteredListings);

/* Get all listings in a radius around lat and lng */
router.get("/byRadius", getListingsByRadius);

/* Get all listings belonging to user in parameter */
router.get("/byUserId/:userId", getListingsByUser);

/* Get listing by listingID (MongoDB Object ID) */
router.get("/byId/:id", getListingsByID);

/* Get listing by search term */
router.post("/search", getListingsBySearch);

/* Delete listing by id */
router.delete("/delete/:listingId", requireUserAuth, deleteListingByID);

router.put("/syncListing/:listingId", syncListingsByID);

// Get all transfer requests
router.get("/byTransferEmail", requireUserAuth, getTransferRequests);

// Send request to transfer listing
router.put("/sendListingTransfer", requireUserAuth, sendTransferRequest);

// Accept request(s)
router.put("/acceptListingTransfer", requireUserAuth, acceptTransferRequest);

// Reject request(s)
router.put("/rejectListingTransfer", requireUserAuth, rejectTransferRequest);

router.put("/increment/:listingId", incrementListingVisit);

router.get("/popularlistings/:numberOfListing", getPopularListings);

router.get("/allPopularityListings", getAllPopularListings);

router.post("/exportListing", requireUserAuth, exportListings);

module.exports = router;
