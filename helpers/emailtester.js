const { sendReminder } = require("./expiredListings.helper.js");
const { sendVerificationEmail } = require("./account.helper.js");
const { sendConfirmationEmail } = require("./emails.helper.js");

// Replace this with your own email address and name

const email = "nishantb1130@gmail.com";
const name = "YOUR_NAME";
const listing = "house";
const listingID = "12345";
const userId = "test";

// Email functions to test
// sendReminder(name, email, listing);
// sendVerificationEmail(name, email, userId);
sendConfirmationEmail(name, email, listingID);
