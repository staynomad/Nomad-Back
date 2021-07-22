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

const email = "nishantbalaji30@gmail.com";
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
sendExpirationReminder(name, email, listing);
sendVerificationEmail(name, email, userId);
sendConfirmationEmail(name, email, listingID);
sendTransferInvite(name, email, "John");
sendTransferAccept(name, email, "John", listings);
sendTransferRejection(name, email, "John", listings);
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
