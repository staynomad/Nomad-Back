const { exportURL } = require("../config/index");

const exportListingCalendar = async (req, res) => {
  const file = `./exports/${req.params.filename}`;
  res.download(file);
};

module.exports = { exportListingCalendar };
