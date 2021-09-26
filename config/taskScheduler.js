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

    const helperFunc = async (name) => {
      const oldResult = await Housekeeping.findOne({ name });
      let oldIndex = oldResult.payload.length - 1; //Gets the last array element from the payload
      let oldCount;
      let oldDay;

      //Checks if there are zero objects in array.
      if (oldIndex === -1) {
        oldCount = 0;
      } else {
        //Gets the previous object's count in the array.
        oldCount = oldResult.payload[oldIndex].count;
        oldDay = oldResult.payload[oldIndex].date;
      }

      /*Prevents the housekeeping from pushing a new object (mostly for testing purposes since the cron job will only run once each day.*/
      if (field === oldDay) {
        return;
      }

      //Pushes a new payload object to keep track of the date and count
      await Housekeeping.findOneAndUpdate(
        { name },
        {
          $push: {
            payload: { date: field, count: oldCount },
          },
        }
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
