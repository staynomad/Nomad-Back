/* BASE PATH: /container */

const express = require("express");
const router = express.Router();
const {
  newContainer,
  deleteContainer,
  addListing,
  deleteListing,
  getContainer,
  allContainers,
} = require("../controllers/container.controller");

/*
INPUT:
  title (body) - string name of new container
  listings (body) - array of listing IDs pertaining to new container
DESCRIPTION:
  creates new listing container
*/
router.post("/", newContainer);

/*
INPUT:
  title (body) - string name of container to delete
DESCRIPTION:
  deletes existing listing container by title
*/
router.delete("/byTitle", deleteContainer);

/*
INPUT:
  title (body) - string name of container to delete
  listingId (body) - ID of listing to add
DESCRIPTION:
  adds listing to listing container specified by title
*/
router.post("/addListing", addListing);

/*
INPUT:
  title (body) - string name of container to return
DESCRIPTION:
  gets lsiting container by title
*/
router.get("/byTitle", getContainer);

/*
INPUT:
  title (body) - string name of container to delete
  listingId (body) - ID of listing to add
DESCRIPTION:
  deletes listing from listing container
*/
router.delete("/deleteListing", deleteListing);

/*
INPUT:
  N/A
DESCRIPTION:
  returns all listing containers
*/
router.get("/allContainers", allContainers);

module.exports = router;
