const express = require("express");
const router = express.Router();
const { nodemailerPass } = require("../config");
const Reservation = require("../models/reservation.model");
const Listing = require("../models/listing.model");
const { requireUserAuth, getUserInfo } = require("../utils");
const nodemailer = require("nodemailer");

// Create a reservation
router.post("/createReservation", requireUserAuth, async (req, res) => {
  try {
    const { listingId, days, numDays } = req.body;
    const listingInfo = await Listing.findById(listingId);
    if (!listingInfo) {
      return res.status(404).json({
        errors: "Listing does not exist. Please try again.",
      });
    }
    // Parse string dates to new date objects
    const { availableStart, availableEnd } = {
      availableStart: listingInfo.available[0],
      availableEnd: listingInfo.available[1],
    };

    const { reservationStart, reservationEnd } = {
      reservationStart: days[0],
      reservationEnd: days[1],
    };

    // const availableStart = new Date(listingInfo.available[0]);
    // const availableEnd = new Date(listingInfo.available[1]);
    // const reservationStart = new Date(days[0]);
    // const reservationEnd = new Date(days[1]);

    console.log("listing available: " + listingInfo.available);
    console.log("parsed available: " + availableStart + " | " + availableEnd);
    console.log(
      "reservation dates: " + reservationStart + " | " + reservationEnd
    );
    // Verify that the booked dates and available dates do not conflict with reservation
    if (reservationStart < availableStart || reservationEnd > availableEnd) {
      return res.status(400).json({
        errors: "Selected days are invalid. Please try again.",
      });
    }
    for (let i = 0; i < listingInfo.booked.length; i++) {
      const { bookedStart, bookedEnd } = {
        bookedStart: listingInfo.booked[i].start,
        bookedEnd: listingInfo.booked[i].end,
      };
      if (
        (reservationStart >= bookedStart && reservationStart <= bookedEnd) ||
        (reservationEnd >= bookedStart && reservationEnd <= bookedEnd)
      ) {
        return res.status(400).json({
          errors: "Selected days are invalid. Please try again.",
        });
      }
    }
    // Create a new object in reservations collection and update 'booked' field in listing
    const newReservation = await new Reservation({
      user: req.user._id,
      listingId,
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

    // Create nodemailer transport to send reservation confirmation emails
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "staynomadhomes@gmail.com",
        pass: nodemailerPass,
      },
    });

    const hostInfo = await getUserInfo(bookedListing.userId);
    const guestInfo = await getUserInfo(req.user);

    // Send confirmation email to guest
    const userMailOptions = {
      from: '"NomΛd" <reservations@visitnomad.com>',
      to: guestInfo.email,
      subject: `Your Reservation has been Confirmed: ${bookedListing.title}`,
      text: `Thank you for booking with NomΛd! Here's your reservation information:

              ${bookedListing.title}
              Reservation number: ${reservationInfo._id}
              Address: ${bookedListing.location.street}, ${bookedListing.location.city}, ${bookedListing.location.state}, ${bookedListing.location.zipcode}
              Total cost: $${reservationInfo.totalPrice}
              Days: ${reservationInfo.days[0]} to ${reservationInfo.days[1]}
              Host name: ${hostInfo.name}

          When you arrive at the property, make sure to checkin via the NomΛd website in order to alert the host that you have arrived. If you have any questions or concerns, please reach out to the host at ${hostInfo.email}. To cancel your reservation, please contact us at contact@visitnomad.com. Hope you enjoy your stay!`,
    };
    transporter.sendMail(userMailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log(
          `Reservation confirmation email sent to guest ${guestInfo.email}`
        );
      }
    });

    // Send confirmation email to host
    const hostMailOptions = {
      from: '"NomΛd" <reservations@visitnomad.com>',
      to: hostInfo.email,
      subject: `Your listing has been booked: ${bookedListing.title}`,
      text: `Thank you for listing on NomΛd! Here's the information regarding your listing reservation:

              ${bookedListing.title}
              Reservation number: ${reservationInfo._id}
              Address: ${bookedListing.location.street}, ${
        bookedListing.location.city
      }, ${bookedListing.location.state}, ${bookedListing.location.zipcode}
              Total Payout: $${
                reservationInfo.totalPrice - reservationInfo.hostFee
              }
              Days: ${reservationInfo.days[0]} to ${reservationInfo.days[1]}
              Guest name: ${guestInfo.name}

          We'll send you another email once the guest has checked in. If you have any questions or concerns, please reach out to the guest at ${
            guestInfo.email
          }. To cancel this reservation, please contact us at contact@visitnomad.com. Thank you for choosing NomΛd!`,
    };
    transporter.sendMail(hostMailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log(
          `Reservation confirmation email sent to host ${hostInfo.email}`
        );
      }
    });

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
    /* Temp fix for backwards compatibility */
    const reservationId = reservation.listing
      ? reservation.listing
      : reservation.listingId;
    const bookedListing = await Listing.findById(reservationId);
    if (!reservation) {
      return res.status(404).json({
        errors: ["Reservation does not exist"],
      });
    }

    // Crete nodemailer transport to send emails from
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "staynomadhomes@gmail.com",
        pass: nodemailerPass,
      },
    });

    const hostInfo = await getUserInfo(bookedListing.userId);
    const guestInfo = await getUserInfo(req.user._id);

    // Send checkin confirmation email to guest
    const userMailOptions = {
      from: '"NomΛd" <reservations@visitnomad.com>',
      to: guestInfo.email,
      subject: `Thanks for checking out from ${bookedListing.title}!`,
      text: `You have successfully checked out from your stay! If you have any questions or concerns, please reach out to the host at ${hostInfo.email}.

              ${bookedListing.title}
              Reservation number: ${reservation._id}
              Address: ${bookedListing.location.street}, ${bookedListing.location.city}, ${bookedListing.location.state}, ${bookedListing.location.zipcode}
              Days: ${reservation.days[0]} to ${reservation.days[1]}
              Host name: ${hostInfo.name}

          Hope you enjoy your stay!`,
    };
    transporter.sendMail(userMailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log(
          `Checkout confirmation email sent to guest ${guestInfo.email}`
        );
      }
    });

    // Send checkin confirmation email to host
    const hostMailOptions = {
      from: '"NomΛd" <reservations@visitnomad.com>',
      to: hostInfo.email,
      subject: `${guestInfo.name} has checked out from ${bookedListing.title}!`,
      text: `Your guest has just checked out! If you have any questions or concerns, please reach out to the guest at ${guestInfo.email}.

              ${bookedListing.title}
              Address: ${bookedListing.location.street}, ${bookedListing.location.city}, ${bookedListing.location.state}, ${bookedListing.location.zipcode}
              Days: ${reservation.days[0]} to ${reservation.days[1]}
              Guest name: ${guestInfo.name}

          Thank you for choosing NomΛd!`,
    };
    transporter.sendMail(hostMailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log(
          `Checkout confirmation email sent to host ${hostInfo.email}`
        );
      }
    });

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
    /* Temp fix for reverse compatibility for listingId change in reservations */
    const reservationId = reservation.listing
      ? reservation.listing
      : reservation.listingId;
    const bookedListing = await Listing.findById(reservationId);
    if (!reservation) {
      return res.status(404).json({
        errors: ["Reservation does not exist"],
      });
    }
    // Crete nodemailer transport to send emails from
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "staynomadhomes@gmail.com",
        pass: "yowguokryuzjmbhj",
      },
    });

    const hostInfo = await getUserInfo(bookedListing.userId);
    const guestInfo = await getUserInfo(req.user._id);

    // Send checkin confirmation email to guest
    const userMailOptions = {
      from: '"NomΛd" <reservations@visitnomad.com>',
      to: guestInfo.email,
      subject: `Thanks for checking in to ${bookedListing.title}!`,
      text: `You have successfully checked in to your stay! The host has been notified and will let you in soon. If you have any questions or concerns, please reach out to the host at ${hostInfo.email}.

              ${bookedListing.title}
              Reservation number: ${reservation._id}
              Address: ${bookedListing.location.street}, ${bookedListing.location.city}, ${bookedListing.location.state}, ${bookedListing.location.zipcode}
              Days: ${reservation.days[0]} to ${reservation.days[1]}
              Host name: ${hostInfo.name}

          Hope you enjoy your stay!`,
    };
    transporter.sendMail(userMailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log(
          `Checkin confirmation email sent to guest ${guestInfo.email}`
        );
      }
    });

    // Send checkin confirmation email to host
    const hostMailOptions = {
      from: '"NomΛd" <reservations@visitnomad.com>',
      to: hostInfo.email,
      subject: `${guestInfo.name} has checked in to ${bookedListing.title}!`,
      text: `Your guest has just checked in! Please provide them with the next steps to begin their stay. If you have any questions or concerns, please reach out to the guest at ${guestInfo.email}.

              ${bookedListing.title}
              Address: ${bookedListing.location.street}, ${bookedListing.location.city}, ${bookedListing.location.state}, ${bookedListing.location.zipcode}
              Days: ${reservation.days[0]} to ${reservation.days[1]}
              Guest name: ${guestInfo.name}

          Thank you for choosing NomΛd!`,
    };
    transporter.sendMail(hostMailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log(
          `Checkin confirmation email sent to host ${hostInfo.email}`
        );
      }
    });

    res.status(200).json({
      message: `Activated ${req.params.reservationId}`,
      reservation,
    });
  } catch (error) {
    console.log(error);
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
