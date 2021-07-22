const express = require("express");
const router = express.Router();
const {
  sendReservationConfirmationGuest,
  sendReservationConfirmationHost,
  sendCheckinGuest,
  sendCheckinHost,
  sendCheckoutGuest,
  sendCheckoutHost,
} = require("../helpers/emails.helper");
const Reservation = require("../models/reservation.model");
const Listing = require("../models/listing.model");
const { requireUserAuth, getUserInfo } = require("../utils");

// Create a reservation
router.post("/createReservation", requireUserAuth, async (req, res) => {
  try {
    const { listing, days, numDays } = req.body;
    const listingInfo = await Listing.findOne({
      _id: listing,
    });
    if (!listingInfo) {
      return res.status(400).json({
        errors: "Listing does not exist. Please try again.",
      });
    }
    // Parse string dates to new date objects
    const availableStart = new Date(listingInfo.available[0]);
    const availableEnd = new Date(listingInfo.available[1]);
    const reservationStart = new Date(days[0]);
    const reservationEnd = new Date(days[1]);
    // Verify that the booked dates and available dates do not conflict with reservation
    if (
      reservationStart.getTime() < availableStart.getTime() ||
      reservationEnd.getTime() > availableEnd.getTime()
    ) {
      return res.status(400).json({
        errors: "Selected days are invalid. Please try again.",
      });
    }
    for (let i = 0; i < listingInfo.booked.length; i++) {
      const bookedStart = new Date(listingInfo.booked[i].start);
      const bookedEnd = new Date(listingInfo.booked[i].end);
      if (
        (reservationStart.getTime() >= bookedStart.getTime() &&
          reservationStart.getTime() <= bookedEnd.getTime()) ||
        (reservationEnd.getTime() >= bookedStart.getTime() &&
          reservationEnd.getTime() <= bookedEnd.getTime())
      ) {
        return res.status(400).json({
          errors: "Selected days are invalid. Please try again.",
        });
      }
    }
    // Create a new object in reservations collection and update 'booked' field in listing
    const newReservation = await new Reservation({
      user: req.user._id,
      listing,
      active: false,
      checkedIn: false,
      days,
      guestFee: (listingInfo.price * numDays * 0.1).toFixed(2),
      hostFee: (listingInfo.price * numDays * 0.01).toFixed(2),
      totalPrice: (listingInfo.price * numDays).toFixed(2),
    }).save();
    res.status(201).json({
      reservationId: newReservation._id,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      errors: ["Error creating reservation. Please try again!"],
    });
  }
});

// Activates a reservation -> call after payment
router.put("/activateReservation", requireUserAuth, async (req, res) => {
  try {
    const { listingId, reservationId } = req.body;
    const reservationInfo = await Reservation.findOneAndUpdate(
      { _id: reservationId },
      { $set: { active: true } }
    );
    if (!reservationInfo)
      return res.status(404).json({
        errors:
          "Reservation could not be found.  Please contact us immediately.",
      });

    const { days } = reservationInfo;
    const bookedInfo = {
      start: days[0],
      end: days[1],
      reservationId: reservationInfo._id,
    };
    const bookedListing = await Listing.findOneAndUpdate(
      { _id: listingId },
      { $push: { booked: bookedInfo } }
    );
    if (!bookedListing) {
      return res.status(404).json({
        errors: "Listing could not be found.  Please contact us immediately.",
      });
    }

    const reservationStart = new Date(days[0]);
    const reservationEnd = new Date(days[1]);
    const totalDays =
      (reservationEnd - reservationStart) / (1000 * 3600 * 24) + 1;

    const hostInfo = await getUserInfo(bookedListing.userId);
    const guestInfo = await getUserInfo(req.user);

    sendReservationConfirmationGuest(guestInfo, hostInfo, bookedListing);
    sendReservationConfirmationHost(hostInfo, guestInfo, bookedListing);

    res.status(200).json({});
  } catch (error) {
    console.log(error);
    res.status(500).json({
      errors: ["Error creating reservation. Please try again!"],
    });
  }
});

// Get ALL reservations. Not requiring user auth
router.get("/", async (req, res) => {
  const reservations = await Reservation.find();
  return res.status(200).json({
    reservations: reservations,
  });
});

// Get all reservations by userId
router.get("/getByUser", requireUserAuth, async (req, res) => {
  try {
    const reservation = await Reservation.find({
      user: req.user._id,
    });
    if (!reservation) {
      return res.status(404).json({
        errors: ["User has not made any reservations"],
      });
    }
    res.status(200).json({
      reservations: reservation,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      errors: ["Error creating reservation. Please try again!"],
    });
  }
});

// Get reservations corresponding to listingId
router.get("/getByListing/:listing", async (req, res) => {
  try {
    const reservation = await Reservation.find({ listing: req.params.listing });
    if (!reservation) {
      return res.status(404).json({
        errors: ["User has not made any reservations"],
      });
    }
    res.status(201).json({
      reservations: reservation,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      errors: ["Error creating reservation. Please try again!"],
    });
  }
});

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
router.post("/deactivate/:reservationId", requireUserAuth, async (req, res) => {
  try {
    const update = { active: false };
    const options = { new: true };
    const reservation = await Reservation.findByIdAndUpdate(
      req.params.reservationId,
      update,
      options
    );
    const bookedListing = await Listing.findById(reservation.listing);
    if (!reservation) {
      return res.status(404).json({
        errors: ["Reservation does not exist"],
      });
    }

    const hostInfo = await getUserInfo(bookedListing.userId);
    const guestInfo = await getUserInfo(req.user._id);

    sendCheckoutGuest(guestInfo, hostInfo, bookedListing);
    sendCheckoutHost(hostInfo, guestInfo, bookedListing);

    res.status(200).json({
      message: `Deactivated ${req.params.reservationId}`,
      reservation,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      errors: ["Error creating reservation. Please try again!"],
    });
  }
});

// This will be called when the user checks in
router.post("/activate/:reservationId", requireUserAuth, async (req, res) => {
  try {
    const update = { checkedIn: true };
    const options = { new: true };
    const reservation = await Reservation.findByIdAndUpdate(
      req.params.reservationId,
      update,
      options
    );
    const bookedListing = await Listing.findById(reservation.listing);
    if (!reservation) {
      return res.status(404).json({
        errors: ["Reservation does not exist"],
      });
    }

    const hostInfo = await getUserInfo(bookedListing.userId);
    const guestInfo = await getUserInfo(req.user._id);

    sendCheckinGuest(guestInfo, hostInfo, bookedListing);
    sendCheckinHost(hostInfo, guestInfo, bookedListing);

    res.status(200).json({
      message: `Activated ${req.params.reservationId}`,
      reservation,
    });
  } catch (error) {
    // console.log(error);
    res.status(500).json({
      errors: ["Error checking in. Please try again!"],
    });
  }
});

/* Get listing by listingID (MongoDB Object ID) */
router.get("/byId/:id", async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      res.status(404).json({
        errors: ["Reservation does not exist."],
      });
    } else {
      res.status(200).json({
        reservation,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      errors: ["Error occurred while getting reservations. Please try again!"],
    });
  }
});

module.exports = router;
