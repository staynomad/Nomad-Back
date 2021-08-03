const {
  sendExpirationReminder,
  sendVerificationEmail,
  sendConfirmationEmail,
  sendTransferInvite,
  sendTransferAccept,
  sendTransferRejection,
  sendReservationConfirmationGuest,
  sendReservationConfirmationHost,
  sendCheckinGuest,
  sendCheckinHost,
  sendCheckoutGuest,
  sendCheckoutHost,
} = require("./emails.helper.js");

// Replace this with your own email address and name

const email = "YOUR_EMAIL";
const name = "YOUR_NAME";
const listing = "house";
const listingID = "12345";
const listings = ["12345", "54321"];
const userId = "test";

const guestInfo = {
  name: name,
  email: email,
};

const hostInfo = {
  name: name,
  email: email,
};

const bookedListing = {
  title: "House",
  location: {
    street: "123 Main Street",
    city: "Anytown",
    state: "AnyState",
    zip: "12345",
  },
};

const reservationInfo = {
  _id: "12345",
  days: ["10/10", "10/11"],
  totalPrice: "100",
  hostFee: "10",
};

// Email functions to test

// Gmail blocks when theres more than 12 emails being sent at once, so comment out the
// last two because sendTransferAccept() and sendTransferRejection() both send 2 emails each
// send these two separately
const sendEmails = async () => {
  sendExpirationReminder(name, email, listing);
  sendVerificationEmail(name, email, userId);
  sendConfirmationEmail(name, email, listingID);
  sendTransferInvite(name, email, "John");
  sendTransferAccept(name, email, "John", email, listings);
  sendTransferRejection(name, email, "John", email, listings);
  sendReservationConfirmationGuest(
    guestInfo,
    hostInfo,
    bookedListing,
    reservationInfo
  );
  sendReservationConfirmationHost(
    hostInfo,
    guestInfo,
    bookedListing,
    reservationInfo
  );
  sendCheckinGuest(guestInfo, hostInfo, bookedListing, reservationInfo);
  sendCheckinHost(hostInfo, guestInfo, bookedListing, reservationInfo);
  sendCheckoutGuest(guestInfo, hostInfo, bookedListing, reservationInfo);
  sendCheckoutHost(hostInfo, guestInfo, bookedListing, reservationInfo);
};

sendEmails();
