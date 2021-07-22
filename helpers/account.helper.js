const Housekeeping = require("../models/housekeeping.model");

// Increment users property in housekeeping collection
const incHousekeepingUsers = async () => {
  const curr = new Date();
  const field = curr.getMonth() + 1 + "/" + curr.getDate();
  await Housekeeping.findOneAndUpdate(
    { name: "users" },
    { $inc: { ["payload." + field]: 1 } }
  );
};

module.exports = {
  incHousekeepingUsers,
};
