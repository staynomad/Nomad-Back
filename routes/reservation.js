/* BASE PATH: /reservation */

const express = require("express");
const router = express.Router();
const { requireUserAuth } = require("../utils");
const {
  createReservation,
  activateReservation,
  getAllReservations,
  allReservationsByUserId,
  allReservationsByListingID,
  checkOutReservation,
  checkInReservation,
  getReservationById,
} = require("../controllers/reservation.controller");

/*
INPUT:
  user (requireUserAuth) - object automatically sent by passing in bearer token
  listingId (body) - ID of listing being reserved
  days (body) - array of 2 UTC timestamps, first is start date second is end date
  numDays (body) - int number of days listing is being reserved for
DESCRIPTION:
  creates unactivated reservation in database
*/
router.post("/createReservation", requireUserAuth, createReservation);

/*
INPUT:
  user (requireUserAuth) - object automatically sent by passing in bearer token
  listingId (body) - ID of listing being reserved
  reservationId (body) - ID of reservation being activated
DESCRIPTION:
  cctivates a reservation, called after payment is completed
*/
router.put("/activateReservation", requireUserAuth, activateReservation);

/*
INPUT:
  N/A
DESCRIPTION:
   gets all reservations
*/
router.get("/", getAllReservations);

/*
INPUT:
  user (requireUserAuth) - object automatically sent by passing in bearer token
DESCRIPTION:
  gets all reservations from a specified userId
*/
router.get("/getByUser", requireUserAuth, allReservationsByUserId);

/*
INPUT:
  user (requireUserAuth) - object automatically sent by passing in bearer token
  listing (params) - ID of to get all reservations from
DESCRIPTION:
  gets all reservations from a specified listingId
*/
router.get(
  "/getByListing/:listing",
  requireUserAuth,
  allReservationsByListingID
);

// Replace this with a soft delete so that users can revert if they accidentally delete
/* router.delete(
    "/delete/:reservationId",
    async (req, res) => {
        try {
            const reservation = await Reservation.findByIdandDelete(req.params.reservationId);
            if (!reservation) {
                return res.status(404).json({
                  errors: ["Reservation does not exist"],
              });
            }
            res.status(201).json({
                "message": `Deleted ${req.params.listing}`
            });
        }
        catch(error) {
            console.log(error);
            res.status(500).json({
              "errors":
              ["Error creating reservation. Please try again!"]
            });
        }
    }
) */

/*
INPUT:
  user (requireUserAuth) - object automatically sent by passing in bearer token
  reservationId (params) - ID of reservation being checked out of
DESCRIPTION:
  used to check out user from their stay
*/
router.post("/deactivate/:reservationId", requireUserAuth, checkOutReservation);

/*
INPUT:
  user (requireUserAuth) - object automatically sent by passing in bearer token
  reservationId (params) - ID of reservation being checked into
DESCRIPTION:
  used to check in user to their stay
*/
router.post("/activate/:reservationId", requireUserAuth, checkInReservation);

/*
INPUT:
  id (params) - ID of reservation being requested
DESCRIPTION:
  returns reservation by ID (MongoDB Object ID)
*/
router.get("/byId/:id", getReservationById);

module.exports = router;
