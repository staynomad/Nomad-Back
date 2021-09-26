const Housekeeping = require("../models/housekeeping.model");

// Increment users property in housekeeping collection
const incHousekeepingUsers = async () => {
  const curr = new Date();
  const field = curr.getMonth() + 1 + "/" + curr.getDate();
  await Housekeeping.findOneAndUpdate(
    { name: "users", "payload.date": field },
    { $inc: { "payload.$.count": 1 } }
  );
};

module.exports = {
  incHousekeepingUsers,
};
