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

// Create a reservation
router.post("/createReservation", requireUserAuth, createReservation);

// Activates a reservation -> call after payment
router.put("/activateReservation", requireUserAuth, activateReservation);

// Get ALL reservations. Not requiring user auth
router.get("/", getAllReservations);

// Get all reservations by userId
router.get("/getByUser", requireUserAuth, allReservationsByUserId);

// Get reservations corresponding to listingId
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

// Use this when the user checks out of their stay
router.post("/deactivate/:reservationId", requireUserAuth, checkOutReservation);

// This will be called when the user checks in
router.post("/activate/:reservationId", requireUserAuth, checkInReservation);

/* Get reservation by reservationID (MongoDB Object ID) */
router.get("/byId/:id", getReservationById);

module.exports = router;
