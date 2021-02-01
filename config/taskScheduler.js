const Popularity = require('../models/popularity.model');

const resetDayCounts = () => {
  currDay = new Date().getDay();
  Popularity.findOneAndUpdate(
    { _id: '6016fad4b33f1f851a4f7d0a' },
    {
      $inc: { visitCount: ['$temp'] },
      $set: { ['visits.' + currDay]: 0 },
    }
  ).then(() => console.log('adf'));
};

module.exports = resetDayCounts;
