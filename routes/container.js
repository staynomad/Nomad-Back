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
*/
router.post("/", newContainer);

/*
INPUT:
  title (body) - string name of container to delete
*/
router.delete("/byTitle", deleteContainer);

/*
INPUT:
  title (body) - string name of container to delete
  listingId (body) - ID of listing to add
*/
router.post("/addListing", addListing);

/*
INPUT:
  title (body) - string name of container to return
*/
router.get("/byTitle", getContainer);

/*
INPUT:
  title (body) - string name of container to delete
  listingId (body) - ID of listing to add
*/
router.delete("/deleteListing", deleteListing);

/*
INPUT:
  Null
*/
router.get("/allContainers", allContainers);

module.exports = router;
