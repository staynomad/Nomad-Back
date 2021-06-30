const Popularity = require("../models/popularity.model");
const Housekeeping = require("../models/housekeeping.model");

const resetDayCount = async () => {
  await resetPopularityCount();
  await resetHousekeepingCount();
};

const resetPopularityCount = async () => {
  // everday, reset the count for popularity
  currDay = new Date().getDay();
  await Popularity.find({}, (err, doc) => {
    doc.forEach((listing) => {
      const decrease = listing.visits[currDay] * -1;
      Popularity.findByIdAndUpdate(
        listing._id,
        {
          $set: { ["visits." + currDay]: 0 },
          $inc: { visitCount: decrease },
        },
        (err, doc) => {
          if (!doc) {
            console.log("doc doesn't exist");
          } else if (err) {
            console.log("there was an error");
          } else {
            console.log(doc);
          }
        }
      );
    });
  });

  await Popularity.deleteMany({ visitCount: 0 }, (err) => {
    if (err) {
      console.log("There was an error while deleting");
    } else {
      console.log("successfully deleted empty doc");
    }
  });
};

const resetHousekeepingCount = async () => {
  // resets the users and active listings document
  try {
    const curr = new Date();
    const date = curr.getDate();
    const month = curr.getMonth() + 1; // to deal with javascript off by 1 for month
    const field = month + "/" + date;

    const yesterday = new Date();
    yesterday.setDate(curr.getDate() - 1);
    const oldDate = yesterday.getDate();
    const oldMonth = yesterday.getMonth() + 1;
    const oldField = oldMonth + "/" + oldDate;

    const helperFunc = async (name) => {
      const oldResult = await Housekeeping.findOne({ name });
      let oldPayload = oldResult.payload[oldField];
      if (!oldPayload) {
        oldPayload = 0;
      }
      await Housekeeping.findOneAndUpdate(
        { name },
        { $set: { ["payload." + field]: oldPayload } }
      );
    };

    await helperFunc("users");
    await helperFunc("activeListings");
  } catch (err) {
    console.log(err);
    console.log("There was an error logging housekeeping");
  }
};

module.exports = resetDayCount;
