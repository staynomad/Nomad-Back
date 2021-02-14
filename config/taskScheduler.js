const Popularity = require('../models/popularity.model');

const resetDayCounts = async () => {
  currDay = new Date().getDay();
  await Popularity.find({}, (err, doc) => {
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

  await Popularity.deleteMany({ visitCount: 0 }, (err) => {
    if (err) {
      console.log('There was an error while deleting');
    } else {
      console.log('successfully deleted empty doc');
    }
  });
};

module.exports = resetDayCounts;
