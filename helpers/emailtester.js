const { sendReminder } = require("./expiredListings.helper.js");
const { sendVerificationEmail } = require("./account.helper.js");

// Replace this with your own email address and name

const email = "YOUR_EMAIL";
const name = "YOUR_NAME";
const listing = "house";
const userId = "test";

// Email functions to test
sendReminder(name, email, listing);
sendVerificationEmail(name, email, userId);
