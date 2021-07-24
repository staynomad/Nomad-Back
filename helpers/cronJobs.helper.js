const https = require("https");
const resetDayCount = require("../config/taskScheduler");
const { findExpiringListings } = require("./expiredListings.helper");

function allCronJobs() {
  console.log("running cron jobs");
  resetDayCount();
  pingHealthCheck();
  findExpiringListings();
  console.log("finished cron jobs");
}

const pingHealthCheck = async () => {
  console.log("Pinging Test");
  await https
    .get("https://hc-ping.com/aa5812c2-7b3f-4572-b7cb-5c2ee53bc3fa")
    .on("error", (err) => {
      console.log("Ping failed: " + err);
    });
};

module.exports = {
  allCronJobs,
};
