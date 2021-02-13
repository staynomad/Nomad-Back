const Popularity = require('../models/popularity.model');
const mongoose = require('mongoose');

const resetDayCounts = () => {
  currDay = new Date().getDay();
  Popularity.find({}, (err, doc) => {
    doc.forEach((listing) => {
      const decrease = listing.visits[currDay] * -1;
      Popularity.findByIdAndUpdate(
        listing._id,
        {
          $set: { ['visits.' + currDay]: 0 },
          $inc: { visitCount: decrease },
        },
        (err, doc) => {
          if (!doc) {
            console.log("doc doesn't exist");
          } else if (err) {
            console.log('there was an error');
          } else {
            console.log(doc);
          }
        }
      );
    });
  });
};

module.exports = resetDayCounts;
