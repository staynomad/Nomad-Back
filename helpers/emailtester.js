const { sendReminder } = require("./expiredListings.helper.js");
const { sendVerificationEmail } = require("./account.helper.js");

const email = "nishantb1130@gmail.com";
const name = "Nishant";
const listing = "house";
const userId = "test"

sendReminder(name, email, listing);
sendVerificationEmail(name, email, userId);
