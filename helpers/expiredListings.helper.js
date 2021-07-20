const { sendEmail, getHTML, getAttachments } = require("./nodemailer.helper");
const { baseURL } = require("../config/index");
const Listing = require("../models/listing.model");
const User = require("../models/user.model");

const findExpiringListings = async function () {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const week = 7;
    const convertMilli = 1000;
    const convertSecMin = 60;
    const convertHour = 24;

    const listings = await Listing.find({});
    for (const listing of listings) {
      // Calculations
      const listDate = new Date(listing.available[1]);
      const diffTime = today - listDate;
      const daysPastExpiration = Math.round(
        diffTime / (convertHour * convertSecMin * convertSecMin * convertMilli)
      );

      // Sending reminder a week before a listing's expiration
      if (
        listing.userId !== undefined &&
        listing.reminder != true &&
        0 >= daysPastExpiration &&
        daysPastExpiration >= -7
      ) {
        // Find the associated user.
        const user = User.findOne(listing.userId);
        const email = user.email;
        const name = user.name;

        // Send the reminder.
        sendReminder(name, email, listing.title);

        // Mark reminder as sent.
        listing.reminder = true;
        listing.save();
      }

      // Separate check to update listing status to inactive the day after expiration date
      if ((listing.active = true && daysPastExpiration > 0)) {
        // mark listing as inactive
        listing.active = false;
        listing.save();
      }
    }
  } catch (err) {
    console.log(err);
  }
};

const sendReminder = async (name, email, listingName) => {
  const HTMLOptions = {
    greeting: `Dear ${name},`,
    alert: "YOUR LISTING IS EXPIRING SOON!",
    action: "Update your listing now!",
    description: `Please check your account, as your listing for
     <b style="color:white">${listingName}</b> expires next week.`,
    buttonText: "Take me There!",
    buttonURL: `${baseURL}/myAccount`,
  };
  const html = getHTML(HTMLOptions);
  const attachments = getAttachments();

  const userMailOptions = {
    from: '"NomΛd" <reservations@visitnomad.com>',
    to: email,
    subject: `Your Listing is Expiring Soon!`,
    html: html,
    attachments: attachments,
  };
  sendEmail(userMailOptions);
};

module.exports = {
  findExpiringListings,
  sendReminder,
};
