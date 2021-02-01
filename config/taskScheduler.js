const Popularity = require('../models/popularity.model');

const resetDayCounts = () => {
  currDay = new Date().getDay();
  Popularity.find({}, (err, doc) => {
    doc.forEach((listing) => {
      const decrease = listing.visits[currDay] * -1;
      Popularity.findByIdAndUpdate(
        { _id: listing._id },
        { $set: { ['visits.' + currDay]: 0 }, $inc: { visitCount: decrease } }
      );
    });
  });
};

module.exports = resetDayCounts;
