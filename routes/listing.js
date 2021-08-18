/* BASE PATH: /listings */

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
INPUT:
  user (requireUserAuth) - object automatically sent by passing in bearer token
  file (file) - new listing data wrapped as a file
DESCRIPTION:
  creates an unactivated listing in database
*/
router.post("/createListing", multerUploads, requireUserAuth, createListing);

/*
INPUT:
  user (requireUserAuth) - object automatically sent by passing in bearer token
  listingId (params) - ID of listing to be activated
DESCRIPTION:
  changes listing's active field to true
*/
router.put("/activateListing/:listingId", requireUserAuth, activateListing);

/*
INPUT:
  user (requireUserAuth) - object automatically sent by passing in bearer token
  listingId (params) - ID of listing to be deactivated
DESCRIPTION:
  changes listing's active field to false
*/
router.put("/deactivateListing/:listingId", requireUserAuth, deactivateListing);

/*
INPUT:
  user (requireUserAuth) - object automatically sent by passing in bearer token
  listingId (params) - ID of listing to be updated
  file (file) - updated listing data wrapped as a file
DESCRIPTION:
  updates the listing specified by listingId
*/
router.put(
  "/editListing/:listingId",
  multerUploads,
  requireUserAuth,
  editListing
);

/*
INPUT:
  user (requireUserAuth) - object automatically sent by passing in bearer token
  listingId (params) - ID of listing to be updated
  imageURLs (body) - array of image URLs of updated listing photos
DESCRIPTION:
  delete or edit image(s) from a listing
*/
router.put("/editListingImages/:listingId", requireUserAuth, editListingImages);

/*
INPUT:
  N/A
DESCRIPTION:
  gets all listings in database
*/
router.get("/", getAllListings);

/*
INPUT:
  N/A
DESCRIPTION:
  gets all active listings (specified with active: true) in database
*/
router.get("/active", getActiveListings);

/*
INPUT:
  filters (body) - object with filter params and values; currently can filter by state/country, max price, min guests
DESCRIPTION:
  gets all listings filtered by input body
*/
router.post("/filteredListings", getFilteredListings);

/*
INPUT:
  lat (query) - latitude of coordinate to filter from
  lng (query) - longitude of coordinate to filter from
  radiusInKilometers (query) - radius around coordinate to return listings from
DESCRIPTION:
  gets all listings in a given radius around given coordinate
*/
router.get("/byRadius", getListingsByRadius);

/*
INPUT:
  userId (params) - ID of host to get listings from
DESCRIPTION:
  gets all listings created by given userId
*/
router.get("/byUserId/:userId", getListingsByUser);

/*
INPUT:
  id (params) - ID of listing to return
DESCRIPTION:
  gets listing by listingID (MongoDB Object ID)
*/
router.get("/byId/:id", getListingsByID);

/*
INPUT:
  itemToSearch (body) - string being input to search box
DESCRIPTION:
  get listing by search term using Atlas search
*/
router.post("/search", getListingsBySearch);

/*
INPUT:
  user (requireUserAuth) - object automatically sent by passing in bearer token
  id (params) - ID of listing to delete
DESCRIPTION:
  delete listing by listingID (MongoDB Object ID)
*/
router.delete("/delete/:listingId", requireUserAuth, deleteListingByID);

/*
INPUT:
  listingId (params) - ID of listing to be synced
  booked (body) - array of objects containing listing unavailability dates
DESCRIPTION:
  update listing availability with imported data
*/
router.put("/syncListing/:listingId", syncListingsByID);

/*
INPUT:
  user (requireUserAuth) - object automatically sent by passing in bearer token
DESCRIPTION:
  gets all transfer requests corresponding to user's email
*/
router.get("/byTransferEmail", requireUserAuth, getTransferRequests);

/*
INPUT:
  user (requireUserAuth) - object automatically sent by passing in bearer token
  email (body) - string email of recipient of transfer request
  listingId (body) - ID of listing being transferred
DESCRIPTION:
  sends request to transfer listing
*/
router.put("/sendListingTransfer", requireUserAuth, sendTransferRequest);

/*
INPUT:
  user (requireUserAuth) - object automatically sent by passing in bearer token
  acceptAll (body) - boolean indicating if all pending requests should be accepted
  listingId (body) - ID of listing whose request is being accepted
DESCRIPTION:
  transfers listing ownership from request sender to logged in user
*/
router.put("/acceptListingTransfer", requireUserAuth, acceptTransferRequest);

/*
INPUT:
  user (requireUserAuth) - object automatically sent by passing in bearer token
  rejectAll (body) - boolean indicating if all pending requests should be rejected
  listingId (body) - ID of listing whose request is being rejected
DESCRIPTION:
  removes transfer request from sender to logged in user
*/
router.put("/rejectListingTransfer", requireUserAuth, rejectTransferRequest);

/*
INPUT:
  listingId (params) - ID of listing whose popularity count is being incremented
DESCRIPTION:
  increments visit count for listing in popularities collection
*/
router.put("/increment/:listingId", incrementListingVisit);

/*
INPUT:
  numberOfListing (params) - int number of most popular listings to be returned
DESCRIPTION:
  returns the numberOfListing most popular listings indicated by popularities collection
*/
router.get("/popularlistings/:numberOfListing", getPopularListings);

/*
INPUT:
  N/A
DESCRIPTION:
  returns all listings in popularities collection (listings that have been clicked >1 in past week)
*/
router.get("/allPopularityListings", getAllPopularListings);

/*
INPUT:
  user (requireUserAuth) - object automatically sent by passing in bearer token
  listingId (body) - ID of listing whose popularity count is being incremented
  listingCalendar (body) - object containing available and booked arrays with UTC timestamps
DESCRIPTION:
  generates and saves an ical file with listing availability data in the exports folder
*/
router.post("/exportListing", requireUserAuth, exportListings);

module.exports = router;
