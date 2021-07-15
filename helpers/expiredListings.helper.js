const { sendEmail } = require("./nodemailer.helper");
const { baseURL } = require("../config/index");
const Listing = require("../models/listing.model");
const User = require("../models/user.model");

const findExpiringListings = async function () {
  try {
    const today = new Date();
    today.setHours(0,0,0,0);
    const week = 7;
    const convertMilli = 1000;
    const convertSecMin = 60;
    const convertHour = 24;

    const listings = await Listing.find({})
    for (const listing of listings) {

      // Calculations
      const listDate = new Date(listing.available[1]);
      const diffTime = (today - listDate);
      const daysPastExpiration = Math.round(diffTime /
        (convertHour * convertSecMin * convertSecMin * convertMilli));

      // Sending reminder a week before a listing's expiration
      if (listing.userId !== undefined && listing.reminder != true && 0 >= daysPastExpiration && daysPastExpiration >= -7 ) {
        // Find the associated user.
        const user = User.findOne(listing.userId);
        const email = user.email;

        // Send the reminder.
        sendReminder(email, listing.title);

        // Mark reminder as sent.
        listing.reminder = true;
        listing.save()
      }


      // Separate check to update listing status to inactive the day after expiration date
      if (listing.active = true && daysPastExpiration > 0 ){
        // mark listing as inactive
        listing.active = false;
        listing.save();
      }
    }
  } catch (err) {
    console.log(err);
  }
};

const sendReminder = async (email, listingName) => {
  const userMailOptions = {
    from: '"NomΛd" <reservations@visitnomad.com>',
    to: email,
    subject: `Your Listing is Expiring Soon!`,
    text: `Please check your account, as your listing for ${listingName} expires next week.`,
    html: `<p>
              Please check your account, as your listing for <b>${listingName}</b> expires next week.
              Visit
              <a href="${baseURL}/myAccount">here</a>
              to update your listing.
             </p>`,
  };
  sendEmail(userMailOptions);
};


module.exports = {
  findExpiringListings,
};


// if listing expires in a week, send an email to host
//   - go through all the listings
//   - check if each listing that is a week away (only one for each listing) from expiration
//   - send a mail to the user that corresponds to listing for each listing that is about to expire
//   - repeat for each listing
//   - listings that have already been sent a reminder about their expiration should not receive additional reminders