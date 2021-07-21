const moment = require("moment");
const mongoose = require("mongoose");
const path = require("path");
const prompt = require("prompt");

const ENV = require("dotenv").config({
  path: path.resolve(__dirname, "../.env"),
}).parsed;
const Listing = require("../models/listing.model");
const Reservation = require("../models/reservation.model");

prompt.start();
const property = {
  name: "confirm",
  description:
    "This script will update all the dates in the reservations (days) and listings (available, booked) collections. Continue? (y/n)",
  pattern: /y[es]*|n[o]?/,
  message: "Must respond yes or no.",
  default: "no",
};
prompt.get(property, function (err, { confirm }) {
  if (err) throw err;
  if (confirm === "y" || confirm === "ye" || confirm === "yes") {
    new Promise((res) => {
      mongoose
        .connect(ENV.DATABASE_URI, {
          useCreateIndex: true,
          useNewUrlParser: true,
          useUnifiedTopology: true,
        })
        .then(async () => {
          /* Rename all reservations' listing var to listingId */
          await (async () => {
            console.log(
              "\x1b[33m%s\x1b[0m",
              "Updating reservation listing variables..."
            );
            await Reservation.updateMany(
              {},
              { $rename: { listing: "listingId" } },
              { strict: false },
              (err) => {
                if (err) {
                  throw err;
                }
                console.log(
                  "\x1b[32m%s\x1b[0m",
                  "Successfully renamed reservation listing to listingId!"
                );
              }
            );
          })();

          const convertDate = (date, setTimeLate = false) => {
            let curDate = moment(date).utc().startOf("day");

            /* End date should have setTimeLate = true */
            if (setTimeLate) curDate.endOf("day");

            /* Convert to UTC timestamp */
            const date_timestamp = curDate.valueOf();
            return date_timestamp;
          };

          /* Convert all reservation dates to UTC timestamps */
          await (async () => {
            console.log("\x1b[33m%s\x1b[0m", "Updating reservation dates...");
            const reservations = await Reservation.find();

            for (let i = 0; i < reservations.length; i++) {
              const reservationDoc = reservations[i];

              const updatedDays = [
                convertDate(reservationDoc.days[0]),
                convertDate(reservationDoc.days[1], true),
              ];

              await Reservation.updateOne(
                { _id: reservationDoc._id },
                { $set: { days: updatedDays } },
                (err) => {
                  if (err) throw err;
                }
              );
            }

            console.log(
              "\x1b[32m%s\x1b[0m",
              "Successfully updated reservation dates!"
            );
          })();

          /* Convert all listing dates to UTC timestamps */
          await (async () => {
            console.log("\x1b[33m%s\x1b[0m", "Updating listing dates...");
            const listings = await Listing.find();

            for (let i = 0; i < listings.length; i++) {
              const listingDoc = listings[i];

              const updatedAvailability = [
                convertDate(listingDoc.available[0]),
                convertDate(listingDoc.available[1], true),
              ];

              const updatedBooked = listingDoc.booked.map((booking) => {
                return {
                  ...booking,
                  start: convertDate(booking.start),
                  end: convertDate(booking.end, true),
                };
              });

              await Listing.updateOne(
                { _id: listingDoc._id },
                {
                  $set: {
                    available: updatedAvailability,
                    booked: updatedBooked,
                  },
                },
                (err) => {
                  if (err) throw err;
                }
              );
            }

            console.log(
              "\x1b[32m%s\x1b[0m",
              "Successfully updated listing dates!"
            );
          })();

          res();
        });
    })
      .then(() => {
        console.log("\x1b[36m%s\x1b[0m", "Script completed successfully.");
        process.exit(0);
      })
      .catch((e) => {
        console.error(e);
        process.exit(1);
      });
  } else {
    process.exit(0);
  }
});
